import React from 'react';
import Urls from "./Urls";
import {withRouter} from "react-router-dom";
import Cookies from 'universal-cookie';


const appStyle = {
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    height: '100vh'
};

const imageStyle = {
    height: '50px',
    margin : '50px 10px'
};

const formStyle = {
    margin: 'auto',
    padding: '10px',
    border: '1px solid #c9c9c9',
    borderRadius: '5px',
    background: '#f5f5f5',
    width: '220px',
    display: 'block'
};

const labelStyle = {
    margin: '10px 0 5px 0',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '15px',
};

const inputStyle = {
    margin: '5px 0 10px 0',
    padding: '5px',
    border: '1px solid #bfbfbf',
    borderRadius: '3px',
    boxSizing: 'border-box',
    width: '100%'
};

const submitStyle = {
    margin: '10px 0 0 0',
    padding: '7px 10px',
    border: '1px solid #efffff',
    borderRadius: '3px',
    background: '#3085d6',
    width: '100%',
    fontSize: '15px',
    color: 'white',
    display: 'block'
};

const Field = React.forwardRef(({label, type}, ref) => {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input ref={ref} type={type} style={inputStyle}/>
        </div>
    );
});

const Form = ({onSubmit}) => {
    const usernameRef = React.useRef();
    const passwordRef = React.useRef();
    const handleSubmit = e => {
        e.preventDefault();

        onSubmit(usernameRef.current.value, passwordRef.current.value);
    };
    return (
        <form style={formStyle} onSubmit={handleSubmit}>
            <Field ref={usernameRef} label="Username:" type="text"/>
            <Field ref={passwordRef} label="Password:" type="password"/>
            <div>
                <button style={submitStyle} type="submit">Submit</button>
            </div>
        </form>
    );
};

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginError: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.goHome = this.goHome.bind(this);
    }

    goHome = () => {
        this.props.history.push('/home');
    }

    handleSubmit = (userName, password) => {
        this.setState({
            loginError: ''
        })
        if (userName === '' || password === '') {
            this.setState({
                loginError: 'Please enter login details.'
            })
            return;
        }
        const data = {
            userName: userName,
            password: password
        };
        const json = JSON.stringify(data, null, 4);
        this.setState({
            loginError: 'Please wait. Logging in...'
        })
        fetch(Urls.LOGIN_URL, {
            method: 'post', body: json
        })
            .then((result) => {
                if (result.status === 200) {
                    result.json().then((json) => {
                        if (json.loginSuccess) {
                            const cookies = new Cookies();
                            console.log("Login Success " + JSON.stringify(json));
                            cookies.set('user', json, {path: '/', maxAge: 360000});
                            this.goHome();
                            //TODO - Need to check why login is inconsistent
                        } else {
                            this.setState({
                                loginError: 'Invalid username or password.'
                            })
                        }
                    });
                }
            }, (error) => {
                console.log(error);
                this.setState({
                    loginError: error
                })
            })
    };

    render() {
        const {
            loginError
        } = this.state;

        return (
            <div style={appStyle}>
                <img src="img/kiku-blue/kiku_logo.png" style={imageStyle} alt="Kiku Logo"/>
                <Form onSubmit={this.handleSubmit}/>
                <span className="text text-danger">{loginError}</span>
            </div>
        );
    }
}


export default withRouter(Login);