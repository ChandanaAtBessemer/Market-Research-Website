# technology_segments_agent.py - Market Technology Segmentation Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for technology segmentation
PROMPT_ID = "pmpt_68bfb28da9b88197b73220fb7ea78eb203fe75cfa56065f9"  # Update this with new prompt ID
PROMPT_VERSION = "1"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_technology_segments(industry: str, retries: int = 3) -> str:
    """
    Analyze market by TECHNOLOGY segments - different underlying technologies.
    Examples: In EV market - Battery Electric, Hydrogen Fuel Cell, Hybrid Technologies
    """
    
    for attempt in range(retries):
        try:
            print(f"Fetching technology segments for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
                model="gpt-4o", 
                input=[{
                    "role": "user", 
                    "content": f"""Analyze the {industry} market by TECHNOLOGY segments. Focus on the different underlying TECHNOLOGIES, technical approaches, or technological categories.

                    Present results as a table:
                    | Technology Type | Description | Technical Features | Market Share | Maturity Level | Key Players | Performance Advantages |
                    
                    Focus only on TECHNOLOGIES and TECHNICAL APPROACHES, not applications or use cases.
                    
                    Examples for EV Technologies:
                    - Battery Electric (BEV) - Pure electric with large batteries
                    - Plug-in Hybrid (PHEV) - Battery + engine, pluggable
                    - Hybrid Electric (HEV) - Battery + engine, non-pluggable  
                    - Fuel Cell (FCEV) - Hydrogen fuel cell technology
                    - Mild Hybrid - Small battery assist
                    
                    Examples for AI Technologies:
                    - Machine Learning - Algorithm-based learning
                    - Deep Learning - Neural network architectures
                    - Natural Language Processing - Text/speech processing
                    - Computer Vision - Image/video analysis
                    - Reinforcement Learning - Reward-based learning
                    
                    Search for current technical specifications and market data for each technology type."""
                }],
                tools=[{"type": "web_search_preview"}],
                temperature=0.3
            )
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "(no output)"
        except RateLimitError:
            delay = 3 + attempt * 2
            print(f"⚠️ Rate limit. Retrying in {delay}s...")
            time.sleep(delay)
        except Exception as e:
            print(f"Error fetching technology segments: {e}")
            break
    return "⚠️ Failed to retrieve market technology segments."

def main():
    import streamlit as st
    st.title("Market Technology Segments Analysis")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get Technology Segments"):
        with st.spinner("Fetching data..."):
            result = get_technology_segments(market)
        st.markdown(result)

if __name__ == "__main__":
    main()