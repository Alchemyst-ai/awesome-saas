import streamlit as st
from alchemyst import initiate_company_research
import time

# Page configuration
st.set_page_config(
    page_title="Company Research AI",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="collapsed"
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
</style>
""", unsafe_allow_html=True)

class StreamlitResearchApp:
    def __init__(self):
        self.status_messages = []
        self.current_report = ""
        self.content = ""
    
    def update_callback(self, content):
        """Callback function to handle real-time updates from the streaming client"""
        # Store the latest content
        self.content = content
        
        # Add status messages for certain types of content
        if any(keyword in str(content).lower() for keyword in ['planning', 'streaming', 'getting', 'tool', 'thinking', 'analyzing']):
            self.status_messages.append(f"🔄 {content}")
        elif content and not any(keyword in str(content).lower() for keyword in ['json', 'error', 'failed']):
            # Add to current report
            self.current_report += str(content) + " "
    
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
        # Reset state for new analysis
        self.status_messages = []
        self.current_report = ""
        self.content = ""
        
        # Create placeholders
        status_placeholder = st.empty()
        report_placeholder = st.empty()
        progress_bar = st.progress(0)
        
        # Start analysis
        with st.spinner(f'Starting analysis for {company_name}...'):
            # Start the streaming analysis in a separate thread-like approach
            import threading
            
            # Variable to store the final result
            final_result = {"report": "", "completed": False}
            
            def run_research():
                try:
                    result = initiate_company_research(company_name, callback=self.update_callback)
                    final_result["report"] = result
                    final_result["completed"] = True
                except Exception as e:
                    final_result["report"] = f"Error: {str(e)}"
                    final_result["completed"] = True
            
            # Start the research thread
            research_thread = threading.Thread(target=run_research)
            research_thread.daemon = True
            research_thread.start()
            
            # Update UI while research is running
            start_time = time.time()
            max_wait_time = 300  # 5 minutes timeout
            
            while not final_result["completed"] and (time.time() - start_time) < max_wait_time:
                # Update progress bar based on time elapsed
                progress = min((time.time() - start_time) / max_wait_time, 0.95)  # Max 95% until complete
                progress_bar.progress(progress)
                
                # Update status messages
                if self.status_messages:
                    status_html = "\n".join([
                        f'<div class="streaming-update">{msg}</div>' 
                        for msg in self.status_messages[-5:]  # Show last 5 messages
                    ])
                    status_placeholder.markdown(
                        f'<div class="status-container">{status_html}</div>', 
                        unsafe_allow_html=True
                    )
                
                # Update report content
                if self.current_report:
                    report_placeholder.markdown(
                        f'<div class="final-report">{self.current_report}</div>', 
                        unsafe_allow_html=True
                    )
                
                time.sleep(0.5)  # Update every 0.5 seconds
            
            # Final updates
            progress_bar.progress(1.0)
            
            if final_result["completed"]:
                if final_result["report"]:
                    status_placeholder.markdown(
                        '<div class="streaming-update">✅ Analysis Complete</div>', 
                        unsafe_allow_html=True
                    )
                    report_placeholder.markdown(
                        f'<div class="final-report">{final_result["report"]}</div>', 
                        unsafe_allow_html=True
                    )
                    return final_result["report"]
                else:
                    # Use the accumulated content if no final report was returned
                    if self.current_report:
                        status_placeholder.markdown(
                            '<div class="streaming-update">✅ Analysis Complete (Using streamed content)</div>', 
                            unsafe_allow_html=True
                        )
                        report_placeholder.markdown(
                            f'<div class="final-report">{self.current_report}</div>', 
                            unsafe_allow_html=True
                        )
                        return self.current_report
                    else:
                        st.error("❌ Analysis completed but no content was generated.")
                        return ""
            else:
                st.error("❌ Analysis timed out. Please try again.")
                return ""
    
    def run(self):
        """Main application runner"""
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
                
                # Add analyze another button
                if st.button("🔄 Analyze Another Company", use_container_width=True):
                    st.rerun()
            else:
                st.error("❌ Analysis failed. Please try again.")
        
        # Show previous report if exists
        elif 'final_report' in st.session_state:
            st.markdown("---")
            st.info(f"Showing previous analysis for {st.session_state.company_name}")
            st.markdown(
                f'<div class="final-report">{st.session_state.final_report}</div>', 
                unsafe_allow_html=True
            )
            
            if st.button("🔄 Analyze New Company", use_container_width=True):
                del st.session_state.final_report
                st.rerun()
        
        # Footer
        st.markdown("---")
        st.caption("Powered by Alchemyst AI • Real-time streaming analysis")

# Run the application
if __name__ == "__main__":
    app = StreamlitResearchApp()
    app.run()