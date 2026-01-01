import api from "./api";

export const postChat = async (message: string) => {
    const res = await api.post(`/chat/post-chat/${encodeURIComponent(message)}`);
    return res.data?.content || res.data || "I didn't get a proper response.";
}