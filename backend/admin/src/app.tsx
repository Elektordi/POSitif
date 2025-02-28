import { Admin, Resource, ShowGuesser } from "react-admin";
import GroupIcon from "@mui/icons-material/Group";

import { Layout } from "./layout";
import { Dashboard } from './dashboard';
import { dataProvider } from './dataProvider';

import { UserList } from "./resources/users";



export const App = () => (
    <Admin dataProvider={dataProvider} layout={Layout} dashboard={Dashboard} disableTelemetry={true}>
        <Resource name="users" list={UserList} show={ShowGuesser} icon={GroupIcon} />
    </Admin>
);