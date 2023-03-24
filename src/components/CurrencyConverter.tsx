import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";

// Define styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }
`;

// Define API endpoint URL and type for currency exchange rates
const API_URL =
  "https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt";

type CurrencyExchangeRate = {
  currency: string;
  code: string;
  rate: number;
};

// Fetch currency exchange rates from API and parse the response
const fetchCurrencyExchangeRates = async () => {
  const response = await fetch(API_URL);
  const text = await response.text();

  const lines = text.split("\n");
  const currencies: CurrencyExchangeRate[] = [];

  // Skip the first two and last lines of the response, which contain metadata
  for (let i = 2; i < lines.length - 1; i++) {
    const [code, rateStr] = lines[i].split("|");
    const currency = lines[i].substring(0, lines[i].indexOf("|")).trim();
    const rate = parseFloat(rateStr.replace(",", "."));

    currencies.push({ currency, code, rate });
  }

  return currencies;
};

// Define the CurrencyConverter component
const CurrencyConverter = () => {
  // Use the useQuery hook from react-query to fetch the currency exchange rates
  const { data, isLoading, error } = useQuery(
    "currencyExchangeRates",
    fetchCurrencyExchangeRates
  );

  // Define state for the amount and selected currency
  const [amount, setAmount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  // Event handler for when the user changes the amount input
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(event.target.value));
  };

  // Event handler for when the user changes the currency select
  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCurrency(event.target.value);
  };

  // Calculate the converted amount based on the selected currency and exchange rate
  const exchangeRate =
    data && data.find((c) => c.code === selectedCurrency)?.rate;
  const convertedAmount =
    selectedCurrency && exchangeRate ? amount / exchangeRate : 0;

  return (
    <Container>
      <>
        {isLoading && <p>Loading currency exchange rates...</p>}
        {error && <p>Error loading currency exchange rates: {error.message}</p>}
        {data && (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Code</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((currency) => (
                  <tr key={currency.code}>
                    <td>{currency.currency}</td>
                    <td>{currency.code}</td>
                    <td>{currency.rate.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div>
              <label htmlFor="amountInput">Amount (CZK)</label>

              <input
                type="number"
                id="amountInput"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
            <div>
              <label htmlFor="currencySelect">Convert to</label>
              <select
                id="currencySelect"
                value={selectedCurrency}
                onChange={handleCurrencyChange}
              >
                <option value="">Select currency</option>
                {data.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.currency}
                  </option>
                ))}
              </select>
            </div>
            {selectedCurrency && (
              <p>
                {amount} CZK = {convertedAmount.toFixed(2)} {selectedCurrency}
              </p>
            )}
          </>
        )}
      </>
    </Container>
  );
};

export default CurrencyConverter;
