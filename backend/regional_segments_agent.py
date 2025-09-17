# regional_segments_agent.py - Market Regional Analysis

import os
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
client = OpenAI()

# You'll need to create a new stored prompt for regional analysis
PROMPT_ID = "pmpt_68ca3e7bd6248196a2bdce6267d45ee20ce220380e811494"  # Update this with new prompt ID
PROMPT_VERSION = "5"

TOOLS = [
    {"type": "web_search_preview"}
]

def get_regional_analysis(industry: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            print(f"Fetching regional analysis for {industry} [attempt {attempt+1}]")
            response = client.responses.create(
                prompt={
                        "id": PROMPT_ID,
                        "version": PROMPT_VERSION
                        },
                input=industry,
                temperature=0.3
            )
            
            final = next((o for o in response.output if getattr(o, "type", "") == "message"), None)
            return "".join(part.text for part in final.content).strip() if final else "No regional data found"
            
        except Exception as e:
            print(f"Error: {e}")
            break
    return "Failed to get regional analysis"

def main():
    result = get_regional_analysis("Plastic Market")
    print(result)

if __name__ == "__main__":
    main()