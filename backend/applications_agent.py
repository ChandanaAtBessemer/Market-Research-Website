# applications_agent.py - Market Applications Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for applications
PROMPT_ID = "pmpt_68bfa6572d8c8197b5760c5faa41969800c1ea839cdcb54f"  # Update this with new prompt ID
PROMPT_VERSION = "2"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_market_applications(industry: str, retries: int = 3) -> str:
    """
    Analyze market by APPLICATION segments - how the market is used/applied.
    This replaces the old "horizontal markets" approach with more accurate terminology.
    """
    
    for attempt in range(retries):
        try:
            print(f"Fetching applications for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
            model="gpt-4o", 
            input=[{
                "role": "user", 
                "content": f"""Analyze the {industry} market by APPLICATION segments. Focus on HOW this technology is USED in different contexts.

                Present results as a table:
                | Application Area | Description | Target Users | Market Share | Growth Rate | Key Players |
                
                Focus only on USE CASES and APPLICATIONS, not general market trends.
                
                Examples for EV:
                - Personal Transportation (individual cars)
                - Commercial Delivery (delivery trucks)  
                - Public Transit (buses)
                - Fleet Operations (corporate fleets)
                - Ride-sharing (Uber/Lyft)
                - Industrial (mining, construction)
                
                Search for current data on each application segment."""
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
            print(f"Error fetching market applications: {e}")
            break
    return "⚠️ Failed to retrieve market applications."

def main():
    import streamlit as st
    st.title("Market Applications Analysis")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get Market Applications"):
        with st.spinner("Fetching data..."):
            result = get_market_applications(market)
        st.markdown(result)

if __name__ == "__main__":
    main()