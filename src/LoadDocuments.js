import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

class LoadDocuments extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            isList: true,
            listLoaded: false,
            listItems: [],
            uniqueID: -1,
            searchString: ''
        };
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadList = this.loadList.bind(this);
        this.showList = this.showList.bind(this);
    }


    handleSearchChange(event) {
        this.setState({searchString: event.target.value});
    }

    handleSubmit(event) {
        this.loadList();
        event.preventDefault();
    }

    showList() {
        this.setState({isList: true});
    }

    componentDidMount() {
        this.loadList();
    }


    loadList() {

        fetch("https://4xmxrqu7be.execute-api.ap-northeast-1.amazonaws.com/Prod/knovaSearch", {
            method: 'post',
            body: JSON.stringify({ "title": this.state.searchString })
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
                            this.setState({
                                listLoaded: true,
                                listItems: result
                            });
                        });
                    } else {
                        this.setState({
                            listLoaded: true,
                            error: {'message': 'Failed to load data. Unknown error occurred'}
                        });
                    }
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        listLoaded: true,
                        error
                    });
                }
            )

    }


    render() {
        const {error, isLoaded, isList, listLoaded, listItems} = this.state;
        const {t} = this.props;

        const searchControlsStyle = {
            verticalAlign: 'top',
            width: '200px'
        };
        const documentStyle = {
            textAlign: 'left',
            margin : '2px',
            padding : '10px'
        };
        const headingStyle = {
            margin: '0px'
        };
        if (isList) {
            if (error) {
                return <div>Error Loading List: {error.message}</div>;
            } else if (!listLoaded) {
                return <div>Loading...</div>;
            } else {
                return (
                    <div>
                        <Table>
                            <tbody>
                            <tr>
                                <td style={documentStyle}>
                                    <form onSubmit={this.handleSubmit}>

                                            <input type="text" value={this.state.searchString}
                                                   onChange={this.handleSearchChange}
                                                   className="form-control form-control-sm"
                                                   id="search"/>&nbsp;&nbsp;
                                        <Button type="submit" onClick={this.handleSubmit}>Search</Button>

                                    </form>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                       {listItems.map(item => (<div  style={documentStyle}><h6 style={headingStyle}>{item.KCTITLE} {item.KCTITLE_JPN_JP}</h6>{item.CONTENT} {item.CONTENT_JPN_JP}<hr/></div>))}
                                </td>
                            </tr>
                            </tbody>
                        </Table>
                    </div>
                );
            }
        } else {

            if (error) {
                return <div>Error Siva: {error.message}</div>;
            } else if (!isLoaded) {
                return <div>Loading...</div>;
            } else {
                return <div>Something went wrong.</div>;
            }
        }
    }
}

export default LoadDocuments;