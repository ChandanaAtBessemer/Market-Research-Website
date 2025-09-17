# end_user_segments_agent.py - Market End-User Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()
PROMPT_ID = "pmpt_68ca41a28ef88195bd130cfd400d0ffd0c23cf5ba367c327"  # Update this with new prompt ID
PROMPT_VERSION = "1"

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
                prompt={
                        "id": PROMPT_ID,
                        "version": PROMPT_VERSION
                        },
                input=industry,
                temperature=0.3
            )
            
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "No end-user data found"
            
        except Exception as e:
            print(f"Error: {e}")
            break
    return "Failed to get end-user analysis"

def main():
    results = get_end_user_analysis("Plastic Market")
    print(results)

if __name__ == "__main__":
    main()