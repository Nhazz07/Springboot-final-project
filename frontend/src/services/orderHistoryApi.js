import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/orders";

export const getOrders = async (token) => {
    const response = await axios.get(
        API_URL,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.data;
};

export const getOrderById = async (id, token) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.data;
};

// Cancel Order
export const cancelOrder = async (id, token) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        null,
        {
            params: {
                status: "CANCELLED",
            },
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.data;
};