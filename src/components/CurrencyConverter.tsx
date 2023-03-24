import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";

// Define styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Converter = styled.div`
  margin: 20px 0;
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

type CurrencyRate = {
  currency: string;
  code: string;
  rate: number;
};

async function fetchRates(): Promise<CurrencyRate[]> {
  const response = await fetch("/api/currency-rates");
  const data = await response.json();

  return data.rates;
}

// Define the CurrencyConverter component
const CurrencyConverter = () => {
  // Use the useQuery hook from react-query to fetch the currency exchange rates
  const { data, isLoading, error } = useQuery("CurrencyRates", fetchRates);

  // Define state for the amount and selected currency
  const [amount, setAmount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  // Event handler for when the user changes the amount input
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(event.target.value);
    if (isNaN(amount)) {
      setAmount(0);
      return; // Return early if the amount is not a number
    }

    setAmount(amount);
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
        {error && <p>Error loading currency exchange rates.</p>}
        {data && (
          <>
            <Converter>
              <h2>Currency Converter</h2>
              <div>
                <label htmlFor="amountInput">Amount (CZK)</label>

                <input
                  pattern="[0-9]+" // Only allow numbers
                  type="text"
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
            </Converter>

            <h2>Exchange Rates</h2>
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
          </>
        )}
      </>
    </Container>
  );
};

export default CurrencyConverter;
