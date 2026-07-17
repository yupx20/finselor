"""AI service — Google Gemini API integration for investment advice."""

import asyncio
import json
import logging
from decimal import Decimal

import google.generativeai as genai

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _build_prompt(surplus: Decimal, risk_profile: str) -> str:
    """Build an anonymized prompt for the Gemini API.

    IMPORTANT: No PII (name, email, user ID) is sent to the external API.
    Only anonymized financial data is included per UU PDP compliance.
    """
    return f"""You are a professional financial advisor AI. Analyze the following anonymized financial data and provide investment allocation recommendations.

FINANCIAL DATA (ANONYMIZED):
- Monthly Surplus: IDR {surplus:,.2f}
- Risk Profile: {risk_profile}

INSTRUCTIONS:
1. Recommend allocation percentages across these asset classes: Mutual Funds, Stocks, Bonds, Forex, Cryptocurrency, Emergency Fund/Savings.
2. Adjust allocations based on the risk profile:
   - Conservative: Prioritize bonds, mutual funds, emergency fund. Minimal crypto/forex.
   - Moderate: Balanced mix across all classes. Moderate crypto/forex.
   - Aggressive: Higher stocks, crypto, forex allocations. Lower bonds.
3. Include a brief market momentum analysis (2-3 sentences).
4. Include risk management notes (2-3 sentences).
5. Include a standard disclaimer.

RESPOND ONLY WITH VALID JSON in this exact format (no markdown, no code blocks):
{{
  "allocations": [
    {{
      "asset_class": "string",
      "percentage": number,
      "amount": number,
      "rationale": "string"
    }}
  ],
  "market_analysis": "string",
  "risk_notes": "string",
  "disclaimer": "string"
}}

Ensure all percentages sum to 100 and all amounts sum to the monthly surplus."""


def _call_gemini_sync(prompt: str) -> dict:
    """Synchronous Gemini API call — runs in a thread pool."""
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    response = model.generate_content(prompt)

    # Parse JSON response
    response_text = response.text.strip()
    # Remove markdown code blocks if present
    if response_text.startswith("```"):
        response_text = response_text.split("\n", 1)[1]
        response_text = response_text.rsplit("```", 1)[0]

    return json.loads(response_text)


async def get_ai_recommendation(surplus: Decimal, risk_profile: str) -> dict:
    """Call Google Gemini API for investment recommendations."""
    if not settings.GEMINI_API_KEY:
        # Return fallback mock data when API key is not configured
        return _get_fallback_recommendation(surplus, risk_profile)

    try:
        prompt = _build_prompt(surplus, risk_profile)
        # Run sync API call in thread pool to avoid blocking the event loop
        result = await asyncio.to_thread(_call_gemini_sync, prompt)
        return result

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        # Fallback to rule-based recommendation
        return _get_fallback_recommendation(surplus, risk_profile)


def _get_fallback_recommendation(surplus: Decimal, risk_profile: str) -> dict:
    """Generate a rule-based fallback recommendation when AI is unavailable."""
    surplus_float = float(surplus)

    profiles = {
        "Conservative": {
            "allocations": [
                {"asset_class": "Bonds", "percentage": 30, "rationale": "Stable fixed-income for capital preservation"},
                {"asset_class": "Mutual Funds", "percentage": 25, "rationale": "Diversified professional fund management"},
                {"asset_class": "Emergency Fund", "percentage": 25, "rationale": "Essential safety net covering 3-6 months expenses"},
                {"asset_class": "Stocks", "percentage": 15, "rationale": "Blue-chip dividend stocks for moderate growth"},
                {"asset_class": "Cryptocurrency", "percentage": 3, "rationale": "Minimal exposure to digital assets"},
                {"asset_class": "Forex", "percentage": 2, "rationale": "Small currency diversification hedge"},
            ],
            "market_analysis": "Current market conditions favor a defensive posture. Bond yields remain attractive for conservative investors. Blue-chip equities with strong dividends provide stability.",
            "risk_notes": "Maintain a minimum 6-month emergency fund. Avoid leveraged instruments. Rebalance quarterly to maintain target allocations.",
        },
        "Moderate": {
            "allocations": [
                {"asset_class": "Stocks", "percentage": 30, "rationale": "Growth-oriented equity exposure across sectors"},
                {"asset_class": "Mutual Funds", "percentage": 25, "rationale": "Index and balanced funds for diversification"},
                {"asset_class": "Bonds", "percentage": 15, "rationale": "Fixed-income stability to anchor portfolio"},
                {"asset_class": "Emergency Fund", "percentage": 15, "rationale": "Maintain adequate liquidity buffer"},
                {"asset_class": "Cryptocurrency", "percentage": 10, "rationale": "Measured digital asset allocation for growth potential"},
                {"asset_class": "Forex", "percentage": 5, "rationale": "Currency pair trading for additional diversification"},
            ],
            "market_analysis": "Markets show mixed signals with moderate volatility. A balanced approach across asset classes provides the best risk-adjusted returns. Technology and infrastructure sectors show momentum.",
            "risk_notes": "Set stop-loss orders on individual positions. Limit any single stock to 5% of total portfolio. Dollar-cost average into volatile assets.",
        },
        "Aggressive": {
            "allocations": [
                {"asset_class": "Stocks", "percentage": 35, "rationale": "High-growth equity positions across emerging sectors"},
                {"asset_class": "Cryptocurrency", "percentage": 20, "rationale": "Significant digital asset exposure for maximum growth"},
                {"asset_class": "Mutual Funds", "percentage": 15, "rationale": "Sector-specific and growth-oriented funds"},
                {"asset_class": "Forex", "percentage": 15, "rationale": "Active currency trading for enhanced returns"},
                {"asset_class": "Emergency Fund", "percentage": 10, "rationale": "Minimum liquidity reserve"},
                {"asset_class": "Bonds", "percentage": 5, "rationale": "Minimal fixed-income as a portfolio stabilizer"},
            ],
            "market_analysis": "Market conditions support aggressive positioning with strong momentum in growth stocks and digital assets. Higher volatility creates opportunities for outsized returns.",
            "risk_notes": "High-risk allocation requires active monitoring. Set strict stop-losses at 10-15%. Be prepared for significant portfolio swings. Only invest funds you can afford to lose.",
        },
    }

    profile = profiles.get(risk_profile, profiles["Moderate"])
    allocs = profile["allocations"]

    for alloc in allocs:
        alloc["amount"] = round(surplus_float * alloc["percentage"] / 100, 2)

    return {
        "allocations": allocs,
        "market_analysis": profile["market_analysis"],
        "risk_notes": profile["risk_notes"],
        "disclaimer": "This recommendation is generated for educational and informational purposes only. It does not constitute financial advice. Past performance is not indicative of future results. Always consult a licensed financial advisor before making investment decisions.",
    }
