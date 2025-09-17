# technology_segments_agent.py - Market Technology Segmentation Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for technology segmentation
PROMPT_ID = "pmpt_68bfb28da9b88197b73220fb7ea78eb203fe75cfa56065f9"  # Update this with new prompt ID
PROMPT_VERSION = "7"

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
                prompt={
                        "id": PROMPT_ID,
                        "version": PROMPT_VERSION
                        },
                input=industry,
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
    '''
    import streamlit as st
    st.title("Market Technology Segments Analysis")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get Technology Segments"):
        with st.spinner("Fetching data..."):
            result = get_technology_segments(market)
        st.markdown(result)
        '''
    result = get_technology_segments("Wheelchair Accessible Vehicles")
    print(result)

if __name__ == "__main__":
    main()