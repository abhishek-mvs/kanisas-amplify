import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import CheckboxTree from 'react-checkbox-tree';
import Urls from './Urls'

class LoadDocuments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedEntitlements: ['SAL_root', 'SAL_BTPUBLIC_1'],
            expandedEntitlements: ['Entitlements'],
            entitlementNodes: [],
            checkedProducts: [],
            expandedProducts: [],
            productNodes: [],
            error: null,
            isLoaded: false,
            items: [],
            listLoaded: false,
            totalHits: null,
            listItems: [],
            staticDataLoaded: false,
            uniqueID: -1,
            searchString: ''
        };
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadList = this.loadList.bind(this);
    }


    handleSearchChange(event) {
        this.setState({searchString: event.target.value});
    }

    handleSubmit(event) {
        this.loadList();
        event.preventDefault();
    }


    componentDidMount() {
        console.log("Component Did mount");
        this.loadEntitlements();
    }

    loadEntitlements() {
        if (this.state.staticDataLoaded) return;
        this.setState({staticDataLoaded: true});
        console.log("Calling entitlements");
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=SAL_root", {
            method: 'get'
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
                            let nodesTemp = result.map(concept => {
                                return {
                                    value: concept.id,
                                    label: concept.names['LA_eng_US'].replace(/(.{15})..+/, "$1..")
                                };
                            })
                            this.setState({
                                entitlementNodes: [{
                                    value: 'Entitlements',
                                    label: 'Entitlements', children: nodesTemp
                                }]
                            });
                            this.loadProducts();
                            this.loadList();
                        });
                    }
                }
            )
    }

    loadProducts() {
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=SG_root", {
            method: 'get'
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
                            let nodesTemp = result.map(concept => {
                                return {
                                    value: concept.id,
                                    label: concept.names['LA_eng_US'].replace(/(.{15})..+/, "$1..")
                                };
                            })
                            this.setState({
                                productNodes: [{
                                    value: 'Products',
                                    label: 'Products', children: nodesTemp
                                }]
                            });
                        });
                    }
                }
            )
    }


    loadList() {
        this.setState({
            listItems: [], listLoaded: false, totalHits: null
        });
        fetch(Urls.DOCUMENT_SEARCH, {
            method: 'post',
            body: JSON.stringify({
                "searchParams": {
                    "userQuery": this.state.searchString,
                    "entitlements": this.state.checkedEntitlements.length > 0 ? this.state.checkedEntitlements.join(",") : "SAL_root",
                    "products": this.state.checkedProducts.length > 0 ? this.state.checkedProducts.join(",") : null,
                }
            })
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
                            console.log("Total Hits " + result.totalHits);
                            this.setState({
                                listLoaded: true,
                                totalHits: result.totalHits,
                                listItems: result.hits
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
        const {error, isLoaded, listLoaded, listItems, totalHits} = this.state;
        const {t} = this.props;

        const searchControlsStyle = {
            verticalAlign: 'top',
            width: '200px'
        };
        const documentStyle = {
            textAlign: 'left',
            margin: '2px',
            padding: '10px',
            verticalAlign: 'top'
        };
        const searchResultsStyle = {
            textAlign: 'left',
            margin: '2px',
            padding: '10px',
            verticalAlign: 'top'
        };
        const headingStyle = {
            margin: '0px'
        };
        const entitlementStyle = {
            height: '200px',
            width: '300px',
            overflow: 'scroll'
        };


        return (
            <div>
                <Table>
                    <tbody>
                    <tr>
                        <td style={documentStyle}>
                            <div style={entitlementStyle}>
                                <CheckboxTree
                                    iconsClass="fa5"
                                    showNodeIcon={false}
                                    nodes={this.state.entitlementNodes}
                                    checked={this.state.checkedEntitlements}
                                    expanded={this.state.expandedEntitlements}
                                    onCheck={checked => this.setState({checkedEntitlements: checked})}
                                    onExpand={expanded => this.setState({expandedEntitlements: expanded})}
                                />
                            </div>
                            <div style={entitlementStyle}>
                                <CheckboxTree
                                    iconsClass="fa5"
                                    showNodeIcon={false}
                                    nodes={this.state.productNodes}
                                    checked={this.state.checkedProducts}
                                    expanded={this.state.expandedProducts}
                                    onCheck={checked => this.setState({checkedProducts: checked})}
                                    onExpand={expanded => this.setState({expandedProducts: expanded})}
                                />
                            </div>
                            <form onSubmit={this.handleSubmit}>

                                <input type="text" value={this.state.searchString}
                                       onChange={this.handleSearchChange}
                                       className="form-control form-control-sm"
                                       id="search"/>&nbsp;&nbsp;
                                <Button type="submit" onClick={this.handleSubmit}>Search</Button>

                            </form>

                        </td>
                        <td style={searchResultsStyle}>
                            <div>{totalHits != null ? ("Total Hits - " + totalHits) : ""}</div>
                            {(listItems != null && listItems.length > 0) ? listItems.map(item => (
                                <div key={item.ID} style={documentStyle}><h6
                                    style={headingStyle}>{item.KCTITLE} {item.KCTITLE_JPN_JP}</h6>{item.CONTENT} {item.METADATA_CONTENT_JPN_JP}
                                    <hr/>
                                </div>)) : <h2> {listLoaded ? "No records found" : "Please wait.. "}</h2>}
                        </td>
                    </tr>
                    </tbody>
                </Table>
            </div>
        );


    }
}

export default LoadDocuments;