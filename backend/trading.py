# backend/trading.py

def get_current_price(shares_sold: int) -> float:
    """
    Calculates the price of the NEXT share to be bought.
    Formula: Base (10) + (Shares_Sold^2 / 20)
    """
    base_price = 10.0
    price = base_price + (shares_sold * shares_sold) / 20
    return round(price, 2)

def calculate_buy_cost(current_shares_sold: int, amount_to_buy: int) -> float:
    """
    Calculates total cost for buying X shares sequentially.
    Since price increases with every share, we sum the cost of each individual share.
    """
    total_cost = 0.0
    for i in range(amount_to_buy):
        # The price of the specific share we are buying (current + 1 + i)
        # Actually, if 0 sold, we buy share #1 (index 0 for calculation purposes)
        price = get_current_price(current_shares_sold + i)
        total_cost += price
    return round(total_cost, 2)

def calculate_sell_value(current_shares_sold: int, amount_to_sell: int) -> float:
    """
    Calculates total return for selling X shares.
    We sell 'backwards' down the curve.
    """
    total_value = 0.0
    for i in range(amount_to_sell):
        # We sell the last share that was sold
        # If 10 sold, we sell share #10, then #9...
        share_index = (current_shares_sold - 1) - i
        price = get_current_price(share_index)
        total_value += price
    return round(total_value, 2)