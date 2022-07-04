import './App.css';
import LoadDocuments from './LoadDocuments';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Login from "./Login";

function App() {
    return <Router>
        <Switch>
            <Route path="/home" component={LoadDocuments}/>
            <Route path="/">
                <Login/>
            </Route>
        </Switch>
    </Router>;
}

export default App;
