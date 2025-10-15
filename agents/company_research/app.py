import streamlit as st
from alchemyst import initiate_company_research, add_content
import time
import os
from io import StringIO

# Page configuration
st.set_page_config(
    page_title="Company Research AI",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for streaming updates
st.markdown("""
<style>
    .streaming-update {
        padding: 12px;
        margin: 8px 0;
        border-radius: 8px;
        border-left: 4px solid #3B82F6;
        background: #1F2937;
        color: #F3F4F6;
        font-family: 'Courier New', monospace;
        animation: fadeIn 0.5s ease-in;
    }
    .error-update {
        padding: 12px;
        margin: 8px 0;
        border-radius: 8px;
        border-left: 4px solid #EF4444;
        background: #7F1D1D;
        color: #FECACA;
        font-family: 'Courier New', monospace;
    }
    .final-report {
        background: #1F2937;
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid #374151;
        margin-top: 1rem;
        color: #F3F4F6;
        line-height: 1.6;
    }
    .status-container {
        max-height: 200px;
        overflow-y: auto;
        margin-bottom: 1rem;
    }
    .sidebar-content {
        padding: 1rem;
    }
    .uploaded-file {
        background: #1F2937;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border-radius: 8px;
        border-left: 4px solid #10B981;
    }
</style>
""", unsafe_allow_html=True)

class StreamlitResearchApp:
    def __init__(self):
        self.status_messages = []
        self.current_report = ""
        self.has_error = False  # Add error flag
        
        # Initialize session state for uploaded files
        if 'uploaded_files' not in st.session_state:
            st.session_state.uploaded_files = []
    
    def render_sidebar(self):
        """Render the sidebar for file uploads"""
        with st.sidebar:
            st.markdown("## 📁 File Upload")
            st.markdown("Upload documents to enhance your research")
            
            # File uploader
            uploaded_files = st.file_uploader(
                "Choose files",
                type=['txt', 'pdf', 'doc', 'docx'],
                accept_multiple_files=True,
                help="Upload TXT, PDF, or DOC files with additional company information"
            )
            
            # Process newly uploaded files
            if uploaded_files:
                for uploaded_file in uploaded_files:
                    if uploaded_file.name not in [f['name'] for f in st.session_state.uploaded_files]:
                        file_content = self._process_uploaded_file(uploaded_file)
                        if file_content:
                            st.session_state.uploaded_files.append({
                                'name': uploaded_file.name,
                                'type': uploaded_file.type,
                                'size': uploaded_file.size,
                                'content': file_content
                            })
                            add_content(fileName=uploaded_file.name, fileType=uploaded_file.type, content=file_content)
            
            # Display uploaded files
            if st.session_state.uploaded_files:
                st.markdown("### Uploaded Files")
                for file_info in st.session_state.uploaded_files:
                    st.markdown(f"""
                    <div class="uploaded-file">
                        <strong>📄 {file_info['name']}</strong><br>
                        <small>Type: {file_info['type']} | Size: {file_info['size']} bytes</small>
                    </div>
                    """, unsafe_allow_html=True)
                
                # Clear files button
                if st.button("🗑️ Clear All Files", use_container_width=True):
                    st.session_state.uploaded_files = []
                    st.rerun()
            
            # Add some helpful information
            st.markdown("---")
            st.markdown("### 💡 Tips")
            st.markdown("""
            - Upload financial reports
            - Add company presentations
            - Include market research
            - Supported: TXT, PDF, DOC, DOCX
            """)
    
    def _process_uploaded_file(self, uploaded_file):
        """Process uploaded file and extract text content"""
        try:
            # For text files
            if uploaded_file.type == "text/plain":
                stringio = StringIO(uploaded_file.getvalue().decode("utf-8"))
                return stringio.read()
            
            # For PDF files
            elif uploaded_file.type == "application/pdf":
                try:
                    import PyPDF2
                    pdf_reader = PyPDF2.PdfReader(uploaded_file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text()
                    return text
                except ImportError:
                    st.error("PDF processing requires PyPDF2. Install with: pip install PyPDF2")
                    return None
            else:
                st.warning(f"Unsupported file type: {uploaded_file.type}")
                return None
                
        except Exception as e:
            st.error(f"Error processing file {uploaded_file.name}: {str(e)}")
            return None
    
    def update_callback(self, message_type, content):
        """Callback function to handle real-time updates from the streaming client"""
        if message_type == "status":
            self.status_messages.append(f"🔄 {content}")
        elif message_type == "content":
            # Replace the entire report with new content (complete report)
            self.current_report = content
        elif message_type == "error":
            self.status_messages.append(f"❌ {content}")
            self.has_error = True  # Set error flag
    
    def render_header(self):
        """Render the main header"""
        st.markdown("""
        <div style="text-align: center;">
            <h1 style="font-size: 3rem; background: linear-gradient(45deg, #3B82F6, #8B5CF6); 
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                🏢 Company Research AI
            </h1>
            <p style="color: #9CA3AF; margin-bottom: 2rem;">
                Get comprehensive AI-powered analysis with real-time streaming updates
            </p>
        </div>
        """, unsafe_allow_html=True)
    
    def render_search_section(self):
        """Render the search input section"""
        st.markdown("---")
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            company_name = st.text_input(
                "Company Name",
                placeholder="e.g., Tesla, Apple, Microsoft, Google...",
                label_visibility="collapsed"
            )
            
            analyze_clicked = st.button(
                "🚀 Start Analysis",
                use_container_width=True,
                type="primary"
            )
            
            return company_name, analyze_clicked

    def render_streaming_section(self, company_name):
        """Render the streaming analysis section"""
        self._reset_analysis_state()
        status_placeholder, report_placeholder = self._create_placeholders()
        
        final_report = self._run_analysis_with_updates(company_name, status_placeholder, report_placeholder)
        return self._handle_final_result(final_report, status_placeholder, report_placeholder)

    def _reset_analysis_state(self):
        """Reset state for new analysis"""
        self.status_messages = []
        self.current_report = ""
        self.has_error = False  # Reset error flag

    def _create_placeholders(self):
        """Create UI placeholders"""
        status_placeholder = st.empty()
        report_placeholder = st.empty()
        return status_placeholder, report_placeholder

    def _run_analysis_with_updates(self, company_name, status_placeholder, report_placeholder):
        """Run analysis with real-time UI updates"""
        with st.spinner(f'Starting analysis for {company_name}...'):
            # Get uploaded files content
            uploaded_content = ""
            if st.session_state.uploaded_files:
                uploaded_content = "\n".join([file['content'] for file in st.session_state.uploaded_files])
            
            # Call initiate_company_research with uploaded content
            final_report = initiate_company_research(
                query=company_name,
                uploaded_files_content=uploaded_content,
                callback=self.update_callback
            )
            
            self._update_ui_while_processing(status_placeholder, report_placeholder, final_report)
            return final_report

    def _update_ui_while_processing(self, status_placeholder, report_placeholder, final_report):
        """Update UI in real-time while processing"""
        start_time = time.time()
        max_wait_time = 60  # Reduced timeout since we're not streaming
        
        while time.time() - start_time < max_wait_time:
            self._update_status_messages(status_placeholder)
            self._update_report_content(report_placeholder)
            
            # Check stopping conditions:
            # 1. We have a final report from the function return
            # 2. There's an error flagged in callback
            # 3. We have content from callback (report is complete)
            if (final_report and final_report != "") or self.has_error or self.current_report:
                break
                
            time.sleep(0.5)
        
        # One final update to show everything
        self._update_status_messages(status_placeholder)
        self._update_report_content(report_placeholder)

    def _update_status_messages(self, status_placeholder):
        """Update status messages in UI"""
        if self.status_messages:
            status_html = self._format_status_messages()
            status_placeholder.markdown(f'<div class="status-container">{status_html}</div>', unsafe_allow_html=True)

    def _update_report_content(self, report_placeholder):
        """Update report content in UI"""
        if self.current_report:
            report_placeholder.markdown(f'<div class="final-report">{self.current_report}</div>', unsafe_allow_html=True)

    def _format_status_messages(self):
        """Format status messages with appropriate styling"""
        status_html = ""
        for msg in self.status_messages:
            if "❌" in msg:
                status_html += f'<div class="error-update">{msg}</div>'
            else:
                status_html += f'<div class="streaming-update">{msg}</div>'
        return status_html

    def _handle_final_result(self, final_report, status_placeholder, report_placeholder):
        """Handle the final result display"""
        # Use the final_report returned by the function, or fall back to current_report
        result_report = final_report if final_report else self.current_report
        
        if result_report and result_report.strip():
            status_placeholder.markdown('<div class="streaming-update">✅ Analysis Complete</div>', unsafe_allow_html=True)
            report_placeholder.markdown(f'<div class="final-report">{result_report}</div>', unsafe_allow_html=True)
            return result_report
        else:
            # If no report was generated, show appropriate error
            if self.has_error:
                # Error already shown in status messages
                pass
            else:
                st.error("❌ No research report generated. Please try again with different context or company name.")
            return ""
    
    def run(self):
        """Main application runner"""
        # Render sidebar
        self.render_sidebar()
        
        # Render main content
        self.render_header()
        
        company_name, analyze_clicked = self.render_search_section()
        
        if analyze_clicked and company_name:
            # Start streaming analysis
            final_report = self.render_streaming_section(company_name)
            
            if final_report:
                st.session_state.final_report = final_report
                st.session_state.company_name = company_name
                
                # Add download button
                st.download_button(
                    label="📄 Download Report",
                    data=final_report,
                    file_name=f"{company_name}_research_report.txt",
                    mime="text/plain",
                    use_container_width=True
                )

            else:
                # Error is already shown in the streaming section
                pass
        
        # Show previous report if exists
        elif 'final_report' in st.session_state:
            st.markdown("---")
            st.info(f"Showing previous analysis for {st.session_state.company_name}")
            st.markdown(
                f'<div class="final-report">{st.session_state.final_report}</div>', 
                unsafe_allow_html=True
            )
            
            # Add download button for previous report
            st.download_button(
                label="📄 Download Previous Report",
                data=st.session_state.final_report,
                file_name=f"{st.session_state.company_name}_research_report.txt",
                mime="text/plain",
                use_container_width=True
            )
        
        # Footer
        st.markdown("---")
        st.caption("Powered by Alchemyst AI • Real-time streaming analysis • File upload support")

# Run the application
if __name__ == "__main__":
    app = StreamlitResearchApp()
    app.run()