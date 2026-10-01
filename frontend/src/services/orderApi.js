import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/orders";

export const createOrder = async (orderData, token) => {
    const response = await axios.post(
        API_URL,
        orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type" : "application/json",
            },
        }
    );
    return response.data.data;
}