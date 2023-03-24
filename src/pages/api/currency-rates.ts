import { NextApiRequest, NextApiResponse } from "next";


interface CurrencyRate {
  currency: string;
  code: string;
  rate: number;
}

function parseRates(text: string): CurrencyRate[] {
	// Split the text into dataLines
	const lines = text.split("\n");

	// The first two lines contain metadata, so we skip them
	const dataLines = lines.slice(2);

	const rates: CurrencyRate[] = [];

  for (const line of dataLines) {
    const [country, currency, amount, code, rate] = line.trim().split("|");

		if(rate) {
			// Convert the rate to a number and divide by the amount
			const rateValue = parseFloat(rate.replace(",", ".")) / parseInt(amount, 10);

			rates.push({ currency: `${country} ${currency}`, code, rate: rateValue });
		}
  }

  return rates;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      "https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch currency exchange rates");
    }

    const text = await response.text();
    const rates = parseRates(text);

    res.status(200).json({ rates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
