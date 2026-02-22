import { Text, View } from "react-native";

interface iProfile {
    name: string;
    age: number;
}

const Profile = ({ name, age }: iProfile) => {
    return (
        <View>
            <Text>Halo nama ku, {name}!</Text>
            <Text>Umur ku, {age} tahun</Text>
        </View>
    );
};

export default Profile;