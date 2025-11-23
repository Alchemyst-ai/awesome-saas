import datetime
import os
import shutil
import tempfile
import time

from alchemyst_ai import AlchemystAI
from dotenv import load_dotenv
from google.generativeai import GenerativeModel, configure

# Load env vars
load_dotenv()
ALCHEMYST_KEY = os.getenv("ALCHEMYST_AI_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not ALCHEMYST_KEY or not GEMINI_KEY:
    print("❌ Error: Both ALCHEMYST_AI_API_KEY and GEMINI_API_KEY must be set in .env")
    exit(1)

client = AlchemystAI(api_key=ALCHEMYST_KEY)
configure(api_key=GEMINI_KEY)
model = GenerativeModel("gemini-2.0-flash")

context_id = f"project_navigator_{int(time.time())}"

def create_mock_project(directory: str):
    """Create a small mock project with 3 files."""
    os.makedirs(directory, exist_ok=True)
    files = {
        "main.py": """# main.py
from auth import login_user
from database import get_user_by_id

def main():
    user_id = "user123"
    if login_user("jane_doe", "secretpassword"):
        print("Login OK:", get_user_by_id(user_id))
    else:
        print("Login failed.")

if __name__ == "__main__":
    main()
""",
        "auth.py": """# auth.py
def login_user(username, password):
    return username == "jane_doe" and password == "secretpassword"
""",
        "database.py": """# database.py
def get_user_by_id(user_id):
    db = {
        "user123": {"name": "Jane Doe", "role": "admin"},
        "user456": {"name": "John Smith", "role": "user"},
    }
    return db.get(user_id)
"""
    }
    for name, content in files.items():
        with open(os.path.join(directory, name), "w") as f:
            f.write(content)

def ingest_codebase(path: str):
    """Batch ingest Python files into Alchemyst context with error handling."""
    print(f"Ingesting files from {path}...")

    documents = []

    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                    content = content.replace('\r\n', '\n').replace('\r', '\n')
                    content = ''.join(char for char in content if ord(char) >= 32 or char in '\n\t')
                    
                    if content.strip():  # Only add non-empty files
                        documents.append({
                            "content": content,
                            "metadata": {
                                "filename": file,
                                "filepath": os.path.relpath(file_path, path)
                            }
                        })
                        
                except Exception as e:
                    print(f"⚠️ Error reading {file}: {e}")
                    continue

    if not documents:
        print("⚠️ No Python files found to ingest")
        return

    # Try ingesting files one by one to isolate problematic files
    successful_ingests = 0
    
    for i, doc in enumerate(documents):
        try:
            print(f"Ingesting file {i+1}/{len(documents)}...")
            
            response = client.v1.context.add(
                documents=[doc],
                source="project-codebase",
                context_type="resource",
                scope="internal",
                metadata={
                    "fileName": doc.get("metadata", {}).get("filename", f"file_{i}"),
                    "fileType": "python",
                    "lastModified": datetime.datetime.now().isoformat(),
                    "fileSize": len(doc["content"])
                }
            )
            successful_ingests += 1
            print(f"✔ Successfully ingested {doc.get('metadata', {}).get('filename', f'file_{i}')}")
            
        except Exception as e:
            print(f"❌ Error ingesting {doc.get('metadata', {}).get('filename', f'file_{i}')}: {e}")
            
            # Try with minimal metadata as fallback
            try:
                print("Retrying with minimal metadata...")
                response = client.v1.context.add(
                    documents=[{"content": doc["content"]}],
                    source="project-codebase"
                )
                successful_ingests += 1
                print(f"✔ Successfully ingested with fallback method")
            except Exception as e2:
                print(f"❌ Fallback also failed: {e2}")
                continue
    
    print(f"✔ Successfully ingested {successful_ingests}/{len(documents)} files")

def get_answer(question: str):
    """Search Alchemyst context and answer with Gemini."""
    try:
        results = client.v1.context.search(
            query=question,
            similarity_threshold=0.8, 
            minimum_similarity_threshold = 0.5,
            scope = "internal",
            metadata= None,
        )

        docs = results.contexts or []

        if len(docs) > 0:
            print(f"🔍 Found {len(docs)} relevant documents.")
            contexts = []
            for i, doc in enumerate(docs):
                content = getattr(doc, "content", None) or str(doc)
                contexts.append(f"Context {i+1}: {content}")
            formatted_contexts = "\n\n".join(contexts)

            print("\n" + "─" * 50 + "\n")
            prompt = f"""Based on the following context, please answer the question.
            If the context is insufficient, state that you cannot answer based on the provided information and use your general knowledge.

            Contexts:
            {formatted_contexts}

            Question: {question}"""
        else:
            print("⚠️ No relevant context found, falling back to general knowledge.")
            prompt = question

        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"❌ Error during search/generation: {e}")
        # Fallback to direct Gemini query
        try:
            response = model.generate_content(question)
            return f"[Fallback response - no context used]\n{response.text}"
        except Exception as e2:
            return f"❌ Error: Unable to generate response: {e2}"

def run_cli():
    """Run the Project Navigator CLI."""
    temp_dir = tempfile.mkdtemp()
    
    try:
        create_mock_project(temp_dir)
        ingest_codebase(temp_dir)

        print("\n🧪 Project Navigator ready!")
        print('Ask me about the code. Type "exit" to quit.\n')

        while True:
            q = input("> ").strip()
            if q.lower() in ["exit", "quit", "bye"]:
                break
            if not q:
                continue
            print("Thinking...")
            print(get_answer(q))
            print("-" * 50)
            
    except KeyboardInterrupt:
        print("\n👋 Interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        shutil.rmtree(temp_dir)
        print("👋 Session ended, mock project cleaned up.")

if __name__ == "__main__":
    run_cli()