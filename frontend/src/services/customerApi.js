import axios from "axios";

const PRODUCT_API = "http://localhost:3000/api/v1/products";
const ORDER_API = "http://localhost:3000/api/v1/orders";

export const getProducts = async () => {
    const response = await axios.get(PRODUCT_API);
    return response.data.data;
};

export const getProductById = async (id) => {
    const response = await axios.get(`${PRODUCT_API}/${id}`);
    return response.data.data;
};

export const createOrder = async (orderData, token) => {
    const response = await axios.post(
        ORDER_API,
        orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.data;
};

export const getPurchaseHistory = async (userId, token) => {
    const response = await axios.get(
        `${ORDER_API}/user/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data.data;
};

export const getPurchaseById = async (id, token) => {
    const response = await axios.get(
        `${ORDER_API}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data.data;
};