import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        padding: 12,
        gap: 10,
    },
    card: {
        borderRadius: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    userTextWrap: {
        flex: 1,
    },
    name: {
        fontWeight: "700",
        fontSize: 16,
    },
    email: {
        opacity: 0.7,
    },
    search: {
        margin: 12,
        marginBottom: 0,
    },
});

export default styles;