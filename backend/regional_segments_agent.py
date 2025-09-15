# regional_segments_agent.py - Market Regional Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for regional analysis
PROMPT_ID = "pmpt_NEW_PROMPT_ID_FOR_REGIONAL_ANALYSIS"  # Update this with new prompt ID
PROMPT_VERSION = "1"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_regional_analysis(industry: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            print(f"Fetching regional analysis for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
                model="gpt-4o", 
                input=[{
                    "role": "user", 
                    "content": f"""Search for current market data and analyze the {industry} market by geographical regions. 

I need REAL DATA, not placeholder values. Find actual market sizes, growth rates, and statistics.

Create a table with ACTUAL NUMBERS:

| Region | Market Size (USD) | Growth Rate (CAGR) | Key Countries | Market Share (%) | Leading Players | Key Trends |
|--------|-------------------|-------------------|---------------|------------------|-----------------|------------|

Search for recent market reports, industry data, and regional statistics for the {industry} market. Include:
- Actual market size figures in billions USD
- Real growth rates (CAGR %)  
- Actual market share percentages
- Current leading companies in each region
- Recent trends and developments

Do NOT use placeholder values like "XX" or "X%". Find and include real data from 2023-2025 market research."""
                }],
                tools=[{"type": "web_search_preview"}],
                temperature=0.3
            )
            
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "No regional data found"
            
        except Exception as e:
            print(f"Error: {e}")
            break
    return "Failed to get regional analysis"

def main():
    import streamlit as st
    st.title("Market Regional Analysis")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get Regional Analysis"):
        with st.spinner("Fetching data..."):
            result = get_regional_analysis(market)
        st.markdown(result)

if __name__ == "__main__":
    main()