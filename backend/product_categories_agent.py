# product_categories_agent.py - Market Product Category Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for product categories
PROMPT_ID = "pmpt_68c24f40e3048197b334d54591d657b00306289ef21fe211"  # Update this with new prompt ID
PROMPT_VERSION = "2"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_product_categories(industry: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            print(f"Fetching product categories for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
                model="gpt-4o", 
                input=[{
                    "role": "user", 
                    "content": f"""Analyze the {industry} market by PRODUCT CATEGORY segments. Focus on different PRODUCT TYPES and VARIANTS.

**Required Output Format - Present as Table:**
| Product Category | Description | Target Segment | Market Share | Price Range | Key Players |Sources

**Focus on PRODUCT CATEGORIES, not applications or technologies.**

For {industry} market, show the main product types, categories, and variants available. Include market share data and key manufacturers for each category.

Search for recent product portfolio and market segmentation data."""
                }],
                tools=[{"type": "web_search_preview"}],
                temperature=0.3
            )
            
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "No product category data found"
            
        except Exception as e:
            print(f"Error: {e}")
            break
    return "Failed to get product categories"
def main():
    import streamlit as st
    st.title("Market Product Categories Analysis")
    market = st.text_input("Market", value="Electric Vehicles")
    if st.button("Get Product Categories"):
        with st.spinner("Fetching data..."):
            result = get_product_categories(market)
        st.markdown(result)

if __name__ == "__main__":
    main()