import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import CheckboxTree from 'react-checkbox-tree';
import Chips, {Chip} from 'react-chips'
import Urls from './Urls'

class LoadDocuments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedEntitlements: ['SAL_root', 'SAL_BTPUBLIC_1'],
            expandedEntitlements: ['Entitlements'],
            entitlementNodes: [],
            checkedProducts: [],
            productsMap: {},
            productNodes: [],
            error: null,
            isLoaded: false,
            items: [],
            listLoaded: false,
            totalHits: null,
            listItems: [],
            staticDataLoaded: false,
            uniqueID: -1,
            searchString: '',
            searchDisplayQuery: null
        };
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadList = this.loadList.bind(this);
        this.onProductsChange = this.onProductsChange.bind(this);
    }

    onProductsChange = checkedProducts => {
        this.setState({checkedProducts});
    }

    handleSearchChange(event) {
        this.setState({searchString: event.target.value});
    }

    handleSubmit(event) {
        this.loadList();
        event.preventDefault();
    }


    componentDidMount() {
        this.loadEntitlements();
    }

    loadEntitlements() {
        if (this.state.staticDataLoaded) return;
        this.setState({staticDataLoaded: true});
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
                            let productsMapTemp = result.reduce(function (map, concept) {
                                map[concept.names['LA_eng_US']] = concept.id;
                                return map;
                            }, {});
                            let nodesTemp = Object.keys(productsMapTemp);
                            this.setState({
                                productsMap: productsMapTemp,
                                productNodes: nodesTemp
                            });
                        });
                    }
                }
            )
    }


    loadList() {
        this.setState({
            listItems: [], listLoaded: false, totalHits: null,
            searchDisplayQuery: "Entitlements = " + (this.state.checkedEntitlements.length > 0 ? this.state.checkedEntitlements.join(",") : "SAL_root") + "\nProducts = " + (this.state.checkedProducts.length > 0 ? this.state.checkedProducts.join(",") : "NONE")
                + "\nQuery = " + (this.state.searchString ? this.state.searchString : "NONE") + "\nreturned "
        });
        fetch(Urls.DOCUMENT_SEARCH, {
            method: 'post',
            body: JSON.stringify({
                "searchParams": {
                    "userQuery": this.state.searchString,
                    "entitlements": this.state.checkedEntitlements.length > 0 ? this.state.checkedEntitlements.join(",") : "SAL_root",
                    "products": this.state.checkedProducts.length > 0 ? this.state.checkedProducts.map(chip => this.state.productsMap[chip]).join(",") : null,
                }
            })
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
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
        const {error, isLoaded, listLoaded, listItems, totalHits, searchDisplayQuery} = this.state;
        const {t} = this.props;

        const searchHitsStyle = {
            color: 'blue',
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: '120%',
            margin: 0
        };
        const searchControlsStyle = {
            textAlign: 'left',
            margin: '2px',
            padding: '5px',
            backgroundColor: '#eeeeee',
            verticalAlign: 'top',
            height: '100%'
        };
        const documentStyle = {
            textAlign: 'left',
            verticalAlign: 'top'
        };
        const searchResultsStyle = {
            textAlign: 'left',
            margin: '2px',
            padding: '5px',
            verticalAlign: 'top'
        };
        const headingStyle = {
            margin: '0px'
        };
        const descriptionStyle = {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '30px',
            maxHeight: '50px'
        }
        const entitlementStyle = {
            height: '200px',
            backgroundColor: 'white',
            overflowY: 'scroll'
        };
        const chipsStyle = {};


        return (
            <div className="row no-gutters">
                <div style={searchControlsStyle} className="col-lg-3">
                    <div className="container">
                        Entitlements
                        <div style={entitlementStyle}
                             className="border rounded">
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
                        Choose Products
                        <div style={chipsStyle}>
                            <Chips
                                value={this.state.checkedProducts}
                                onChange={this.onProductsChange}
                                suggestions={this.state.productNodes}
                                className="form-control form-control-lg"
                                fromSuggestionsOnly={true}
                            /></div>
                        <form onSubmit={this.handleSubmit}>
                            <label htmlFor="search">Search Query</label>
                            <input type="text" value={this.state.searchString}
                                   onChange={this.handleSearchChange}
                                   className="form-control"
                                   id="search"/>
                            <Button type="submit" onClick={this.handleSubmit}
                                    className="mt-2 btn btn-primary">Search</Button>

                        </form>
                    </div>

                </div>
                <div style={searchResultsStyle} className="col-lg-8">
                    <pre
                        style={searchHitsStyle}
                        className="">{totalHits != null ? (searchDisplayQuery + totalHits + " results") : ""}</pre>
                    {(listItems != null && listItems.length > 0) ? listItems.map(item => (
                        <div key={item.ID} style={documentStyle}>
                            <hr className="my-1"/>
                            <h6
                                style={headingStyle}>{item.KCEXTERNALID} {item.KCTITLE} {item.KCTITLE_JPN_JP}</h6>
                            <div style={descriptionStyle}>{item.CONTENT} {item.CONTENT_JPN_JP}</div>

                        </div>)) : <pre> {listLoaded ? "No records found" : "Please wait.. "}</pre>}
                </div>
            </div>
        );


    }
}

export default LoadDocuments;