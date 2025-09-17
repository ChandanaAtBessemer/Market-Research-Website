# product_categories_agent.py - Market Product Category Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for product categories
PROMPT_ID = "pmpt_68c24f40e3048197b334d54591d657b00306289ef21fe211"  # Update this with new prompt ID
PROMPT_VERSION = "5"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_product_categories(industry: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            print(f"Fetching product categories for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
                prompt={
                        "id": PROMPT_ID,
                        "version": PROMPT_VERSION
                        },
                input=industry,
                temperature=0.3
            )
            
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "No product category data found"
            
        except Exception as e:
            print(f"Error: {e}")
            break
    return "Failed to get product categories"
def main():
    results = get_product_categories("Plastic MArket")
    print(results)
if __name__ == "__main__":
    main()