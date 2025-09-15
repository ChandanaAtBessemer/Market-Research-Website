# end_user_segments_agent.py - Market End-User Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

TOOLS = [
    {"type": "web_search_preview"}
]

def get_end_user_analysis(industry: str, retries: int = 3) -> str:
    """
    Analyze market by END-USER segments - who actually uses/consumes the products.
    Examples: Individual Consumers, Businesses, Government, Healthcare Providers, etc.
    """
    
    for attempt in range(retries):
        try:
            print(f"Fetching end-user analysis for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
                model="gpt-4o", 
                input=[{
                    "role": "user", 
                    "content": f"""Search for current market data and analyze the {industry} market by END-USER segments. Focus on WHO uses these products/services.

I need REAL DATA with actual market figures. Find current statistics and create a table:

| End-User Segment | Market Size (USD) | Share (%) | Key Needs/Requirements | Growth Rate | Purchasing Behavior | Key Players Serving | Source|
|------------------|-------------------|-----------|------------------------|-------------|---------------------|-------------------|----------------|

For the {industry} market, identify major end-user categories such as:
- Individual Consumers/Households  
- Small/Medium Businesses
- Large Enterprises
- Government/Public Sector
- Healthcare Providers
- Educational Institutions
- Industrial Manufacturers

Search for recent market segmentation data showing:
- Actual revenue/market size by end-user type
- Real market share percentages
- Growth rates by segment
- Specific needs and requirements of each user group

Do NOT use placeholder values. Find real 2023-2025 market data."""
                }],
                tools=[{"type": "web_search_preview"}],
                temperature=0.3
            )
            
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "No end-user data found"
            
        except Exception as e:
            print(f"Error: {e}")
            break
    return "Failed to get end-user analysis"

def main():
    import streamlit as st
    st.title("Market End-User Analysis")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get End-User Analysis"):
        with st.spinner("Fetching data..."):
            result = get_end_user_analysis(market)
        st.markdown(result)

if __name__ == "__main__":
    main()