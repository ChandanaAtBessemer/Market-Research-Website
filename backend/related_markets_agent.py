# related_markets_agent.py - Related Markets Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

PROMPT_ID = "pmpt_68fb0ea6c850819585c25e168d89e2bf0b2e0207465f0fd4"  # ← Update this after creating prompt
PROMPT_VERSION = "3"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_related_markets(industry: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            print(f"Fetching related markets for {industry} [attempt {attempt+1}]")
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
            print(f"Error fetching related markets: {e}")
            break
    return "⚠️ Failed to retrieve related markets."

def main():
    '''
    import streamlit as st
    st.title("Related Markets")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get Related Markets"):
        with st.spinner("Fetching data..."):
            result = get_related_markets(market)
        st.markdown(result)
    '''
    res = get_related_markets("Electric Vehicles")
    print(res)

if __name__ == "__main__":
    main()