import { useMediaQuery, Theme } from "@mui/material";
import { List, SimpleList } from "react-admin";


export const UserList = () => {
    const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
    return (
        <List>
            <SimpleList
                primaryText={(record) => record.email}
            />
        </List>
    );
};
