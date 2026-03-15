export const getCurrencySymbol = (): string =>
    localStorage.getItem('finwise_currency_symbol') || '$';

export const saveCurrencySymbol = (symbol: string) =>
    localStorage.setItem('finwise_currency_symbol', symbol);