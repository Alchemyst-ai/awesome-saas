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
</style>
""", unsafe_allow_html=True)

class StreamlitResearchApp:
    def __init__(self):
        self.status_messages = []
        self.current_report = ""
    
    def update_callback(self, message_type, content):
        """Callback function to handle real-time updates from the streaming client"""
        if message_type == "status":
            # Add status messages
            self.status_messages.append(f"🔄 {content}")
            
            # If it's actual content (not a system message), add to report
            if not any(keyword in content.lower() for keyword in ['starting', 'complete', 'analysis']):
                self.current_report += content + " "
                
        elif message_type == "error":
            self.status_messages.append(f"❌ {content}")
    
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
        self.status_messages = []
        self.current_report = ""
        
        status_placeholder = st.empty()
        report_placeholder = st.empty()
        progress_bar = st.progress(0)
        with st.spinner(f'Starting analysis for {company_name}...'):
            final_report = initiate_company_research(
                company_name, 
                callback=self.update_callback
            )
            
            start_time = time.time()
            max_wait_time = 300  # 5 minutes timeout
            while time.time() - start_time < max_wait_time:
                elapsed_time = time.time() - start_time
                progress = min(elapsed_time / 60, 0.9)  # Cap at 90% until complete
                progress_bar.progress(progress)
                if self.status_messages:
                    status_html = ""
                    for msg in self.status_messages:
                        if "❌" in msg:
                            status_html += f'<div class="error-update">{msg}</div>'
                        else:
                            status_html += f'<div class="streaming-update">{msg}</div>'
                    
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
                
                # If we have a final report from the function, break
                if final_report and final_report != "":
                    break
                time.sleep(0.5)  # Update every 0.5 seconds
            progress_bar.progress(1.0)
            result_report = final_report if final_report else self.current_report
            
            if result_report:
                status_placeholder.markdown(
                    '<div class="streaming-update">✅ Analysis Complete</div>', 
                    unsafe_allow_html=True
                )
                report_placeholder.markdown(
                    f'<div class="final-report">{result_report}</div>', 
                    unsafe_allow_html=True
                )
                return result_report
            else:
                st.error("❌ Analysis failed or timed out. Please try again.")
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

            else:
                st.error("❌ Analysis failed. Please try again.")
        
        elif 'final_report' in st.session_state:
            st.markdown("---")
            st.info(f"Showing previous analysis for {st.session_state.company_name}")
            st.markdown(
                f'<div class="final-report">{st.session_state.final_report}</div>', 
                unsafe_allow_html=True
            )
        
        # Footer
        st.markdown("---")
        st.caption("Powered by Alchemyst AI • Real-time streaming analysis")

# Run the application
if __name__ == "__main__":
    app = StreamlitResearchApp()
    app.run()