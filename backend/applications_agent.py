# applications_agent.py - Market Applications Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for applications
PROMPT_ID = "pmpt_68bfa6572d8c8197b5760c5faa41969800c1ea839cdcb54f"  # Update this with new prompt ID
PROMPT_VERSION = "5"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_market_applications(market: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            print(f"Fetching applications for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
                prompt={
                        "id": PROMPT_ID,
                        "version": PROMPT_VERSION
                        },
                input=industry,      # <-- just a string, not {"submarket": submarket}
                temperature=0.3
            )
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "⚠️ No output returned."
        except RateLimitError:
            delay = 3 + attempt * 2
            print(f"⚠️ Rate limit hit. Retrying in {delay}s...")
            time.sleep(delay)
        except Exception as e:
            print(f" Error: {e}")
            break
    return "⚠️ Failed to retrieve market Applications"

def main():
    '''
    import streamlit as st
    st.title("Market Applications Analysis")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get Market Applications"):
        with st.spinner("Fetching data..."):
            result = get_market_applications(market)
        st.markdown(result)
    '''
    result = get_market_applications("EV")
    print(result)

if __name__ == "__main__":
    main()