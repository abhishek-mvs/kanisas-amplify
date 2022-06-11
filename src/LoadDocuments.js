import React from 'react';
import Button from 'react-bootstrap/Button';
import CheckboxTree from 'react-checkbox-tree';
import Chips from 'react-chips'
import Urls from './Urls'


class LoadDocuments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedEntitlements: ['SAL_root', 'SAL_BTPUBLIC_1'],
            expandedEntitlements: ['Entitlements'],
            entitlementNodes: [],
            checkedEnterpriseSegments: [],
            expandedEnterpriseSegments: [],
            enterpriseSegmentsNodes: [],
            checkedProducts: [],
            productsMap: {},
            productNodes: [],
            error: null,
            loadedDocumentsCount: 1,
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
        this.loadMore = this.loadMore.bind(this);
        this.onProductsChange = this.onProductsChange.bind(this);
    }

    onProductsChange = checkedProducts => {
        this.setState({checkedProducts});
    }

    handleSearchChange(event) {
        this.setState({searchString: event.target.value});
    }

    handleSubmit(event) {
        this.loadList(0);
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
                            this.loadEnterpriseSegments();
                            this.loadList(0);
                        });
                    }
                }
            )
    }

    loadEnterpriseSegments() {
        fetch(Urls.GET_TAXONOMIES + "action=getEnterpriseSegments", {
            method: 'get'
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
                            this.setState({
                                enterpriseSegmentsNodes: result
                            });
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

    loadMore() {
        this.loadList(this.state.loadedDocumentsCount);
    }

    loadList(startKCNum) {
        if (startKCNum === 0) {
            this.setState({
                loadedDocumentsCount: 1
            })
            this.setState({
                listItems: [], listLoaded: false, totalHits: null,
                searchDisplayQuery: "Entitlements = " + (this.state.checkedEntitlements.length > 0 ? this.state.checkedEntitlements.join(",") : "SAL_root") +
                    "\nSegments = " + (this.state.checkedEnterpriseSegments.length > 0 ? this.state.checkedEnterpriseSegments.join(",") : "NONE") +
                    "\nProducts = " + (this.state.checkedProducts.length > 0 ? this.state.checkedProducts.join(",") : "NONE")
                    + "\nQuery = " + (this.state.searchString ? this.state.searchString : "NONE") + "\nreturned "
            });
        }
        fetch(Urls.DOCUMENT_SEARCH, {
            method: 'post',
            body: JSON.stringify({
                "searchParams": {
                    "userQuery": this.state.searchString,
                    "entitlements": this.state.checkedEntitlements.length > 0 ? this.state.checkedEntitlements.join(",") : "SAL_root",
                    "segments": this.state.checkedEnterpriseSegments.length > 0 ? this.state.checkedEnterpriseSegments.join(",") : null,
                    "products": this.state.checkedProducts.length > 0 ? this.state.checkedProducts.map(chip => this.state.productsMap[chip]).join(",") : null,
                    "numKCs": 30,
                    "startKCNum": startKCNum
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
                                listItems: this.state.listItems.concat(result.hits),
                                loadedDocumentsCount: this.state.loadedDocumentsCount + result.hits.length
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
        const {
            error,
            isLoaded,
            listLoaded,
            listItems,
            totalHits,
            loadedDocumentsCount,
            searchDisplayQuery
        } = this.state;

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
            margin: '0px',
            fontSize: '14px'
        }
        const idStyle = {
            fontWeight: 'bold',
            color: 'green'
        };
        const descriptionStyle = {
            overflow: 'hidden',
            fontSize: '12px',
            textOverflow: 'ellipsis',
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
                        Segments
                        <div style={entitlementStyle}
                             className="border rounded">
                            <CheckboxTree
                                iconsClass="fa5"
                                showNodeIcon={false}
                                nodes={this.state.enterpriseSegmentsNodes}
                                checked={this.state.checkedEnterpriseSegments}
                                expanded={this.state.expandedEnterpriseSegments}
                                onCheck={checked => this.setState({checkedEnterpriseSegments: checked})}
                                onExpand={expanded => this.setState({expandedEnterpriseSegments: expanded})}
                            />
                        </div>
                        Products
                        <div style={chipsStyle}>
                            <Chips
                                value={this.state.checkedProducts}
                                onChange={this.onProductsChange}
                                suggestions={this.state.productNodes}
                                className="form-control form-control-lg"
                                fromSuggestionsOnly={true}
                            /></div>
                        <form onSubmit={this.handleSubmit}>
                            <label htmlFor="search">Keywords</label>
                            <input type="text" value={this.state.searchString}
                                   onChange={this.handleSearchChange}
                                   className="form-control"
                                   autoComplete="off"
                                   id="search"/>
                            <Button type="submit" onClick={this.handleSubmit}
                                    className="mt-2 btn btn-primary">Search</Button>

                        </form>
                    </div>

                </div>
                <div style={searchResultsStyle} className="col-lg-8">
                    {error}
                    <pre
                        style={searchHitsStyle}
                        className="">{totalHits != null ? (searchDisplayQuery + totalHits + " results") : ""}</pre>
                    {(listItems != null && listItems.length > 0) ? listItems.map(item => (
                        <div key={item.ID} style={documentStyle}>
                            <hr className="my-1"/>
                            <div style={headingStyle}>
                            <span
                                style={idStyle}>{item.KCEXTERNALID}</span> <span
                                dangerouslySetInnerHTML={{__html: item.KCTITLE}}/> <span
                                dangerouslySetInnerHTML={{__html: item.KCTITLE_JPN_JP}}/></div>
                            <div
                                style={descriptionStyle}> <span
                                dangerouslySetInnerHTML={{__html: item.CONTENT}}/> <span
                                dangerouslySetInnerHTML={{__html: item.CONTENT_JPN_JP}}/></div>

                        </div>)) : <pre> {listLoaded ? "No records found" : "Please wait.. "}</pre>}
                    {totalHits > loadedDocumentsCount ?
                        <a onClick={this.loadMore} className="btn btn-secondary">Load More</a> : null}
                </div>
            </div>
        );
    }
}

export default LoadDocuments;