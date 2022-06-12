import React from 'react';
import Button from 'react-bootstrap/Button';
import CheckboxTree from 'react-checkbox-tree';
import Chips from 'react-chips'
import Urls from './Urls'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { saveAs } from 'file-saver';


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
            documentTypes: [],
            languages: [],
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
            selectedDocumentType: '',
            selectedLanguage: 'LA_eng_US',
            searchDisplayQuery: null,
            resultsWidth: 'col-lg-8',
            documentWidth: 'hidden-lg',
            currentDocument: null
        };
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.loadList = this.loadList.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.openDocument = this.openDocument.bind(this);
        this.openJSON = this.openJSON.bind(this);
        this.onProductsChange = this.onProductsChange.bind(this);
        this.handleDocumentTypeChange = this.handleDocumentTypeChange.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
    }

    onProductsChange = checkedProducts => {
        this.setState({checkedProducts});
    }

    handleLanguageChange(event) {
        this.setState({selectedLanguage: event.value})
    }

    handleDocumentTypeChange(event) {
        this.setState({selectedDocumentType: event.value})
    }

    handleSearchChange(event) {
        this.setState({searchString: event.target.value});
    }

    openDocument(event) {
        event.preventDefault();
        let url = event.currentTarget.getAttribute("data-external-url");
        let fileName = url.substring(url.indexOf("Publishing/") + "Publishing/".length);
        console.log("Called open Document " + fileName);
        fetch(Urls.OPEN_DOCUMENT, {
            method: 'post',
            body: JSON.stringify({
                "fileName": fileName
            })
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.text().then((text) => {
                            text = text.replace("#6699CC", "#303f9f")
                            this.setState({
                                currentDocument: text,
                                resultsWidth: 'col-lg-4',
                                documentWidth: 'col-lg-4'
                            })
                        });
                    }
                }, (error) => {
                    this.setState({
                        currentDocument: "",
                        resultsWidth: 'col-lg-8',
                        documentWidth: 'hidden-lg',
                        error
                    });
                }
            )
    }

    openJSON(event) {
        event.preventDefault();
        let docId = event.currentTarget.getAttribute("data-doc-id");
        fetch(Urls.OPEN_DOCUMENT, {
            method: 'post',
            body: JSON.stringify({
                "docId": docId
            })
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then((json) => {
                            let formattedJSON = '<pre>' + JSON.stringify(json, null, 2) + '</pre>';
                            this.setState({
                                currentDocument: formattedJSON,
                                resultsWidth: 'col-lg-4',
                                documentWidth: 'col-lg-4'
                            })
                        });
                    }
                }, (error) => {
                    this.setState({
                        currentDocument: "",
                        resultsWidth: 'col-lg-8',
                        documentWidth: 'hidden-lg',
                        error
                    });
                }
            )
    }

    handleSubmit(event) {
        this.loadList(0);
        event.preventDefault();
    }

    handleExport(event) {
        this.loadList(0, true);
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
                            });
                            nodesTemp.sort(this.sortNames);
                            this.setState({
                                entitlementNodes: [{
                                    value: 'Entitlements',
                                    label: 'Entitlements', children: nodesTemp
                                }]
                            });
                            this.loadProducts();
                            this.loadEnterpriseSegments();
                            this.loadDocumentTypes();
                            this.loadLanguages();
                            this.loadList(0);
                        });
                    }
                }
            )
    }

    sortNames(a, b) {
        const nameA = a.label.toUpperCase();
        const nameB = b.label.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    };

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

    loadDocumentTypes() {
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=DT_DocType", {
            method: 'get'
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
                            let nodesTemp = result.map(concept => {
                                return {
                                    value: concept.id,
                                    label: concept.names['LA_eng_US']
                                };
                            })
                            nodesTemp.sort(this.sortNames);
                            this.setState({
                                documentTypes: nodesTemp
                            });
                        });
                    }
                }
            )
    }

    loadLanguages() {
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=LA_root", {
            method: 'get'
        })
            .then(
                (result) => {
                    if (result.status === 200) {
                        result.json().then(result => {
                            let nodesTemp = result.map(concept => {
                                return {
                                    value: concept.id,
                                    label: concept.names['LA_eng_US']
                                };
                            })
                            nodesTemp.sort(this.sortNames)
                            this.setState({
                                languages: nodesTemp
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

    loadList(startKCNum, exportDoc=false) {
        if (startKCNum === 0 && exportDoc === false) {
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
        let documentIdMap = {
            "DT_DL_1": "10",
            "DT_HOWTO_1": "9",
            "DT_REFERENCE_1": "8",
            "DT_KNOWNERROR_1": "7",
            "DT_PROBLEMSOLUTION_1": "6",
            "DT_Case" : "-1",
            "DT_SMART_1" : "-1",
            "DT_Topic" : "-1",
            "DT_Insight" : "-1",
            "DT_IQR_1" : "-1",
            "DT_Article" : "-1",
            "DT_QU_1" : "-1",
        };
        //TODO Need to remove this hardCoding
        let constraintChildren = [
            {
                "operation": "And", "children": [
                    {
                        "operation": "Equal",
                        "attributeType": "integer",
                        "attributeName": "RATINGCOUNT",
                        "value": "0"
                    },
                    {
                        "operation": "Less",
                        "attributeType": "integer",
                        "attributeName": "RATING",
                        "value": "125"
                    }
                ]
            },
            {
                "operation": "Or", "children": [
                    {"operation": "Under", "nodeId": this.state.selectedLanguage}
                ]
            }
        ];
        if (this.state.selectedDocumentType !== '' && this.state.selectedDocumentType !== '' && documentIdMap[this.state.selectedDocumentType] !== null && documentIdMap[this.state.selectedDocumentType] !== undefined) {
            constraintChildren = constraintChildren.concat({
                "operation": "Equal",
                "attributeType": "integer",
                "attributeName": "TEMPLATEID",
                "value": documentIdMap[this.state.selectedDocumentType]
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
                    "numKCs": exportDoc ? 500: 30,
                    "startKCNum": startKCNum,
                    "constraints": {
                        "operation": "And",
                        "children": constraintChildren
                    }
                },
                "export" : exportDoc
            })
        })
            .then(
                (result) => {
                    if (exportDoc) {
                        if (result.status === 200) {
                            result.text().then((text) => {
                                var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
                                saveAs(blob, "export.csv");
                            });
                        }
                        return;
                    }
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
            searchDisplayQuery,
            resultsWidth,
            documentWidth,
            currentDocument
        } = this.state;

        const searchHitsStyle = {
            color: '#666ad1',
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: '120%',
            margin: 0
        };
        const submitBtnStyle = {
            backgroundColor: '#666ad1',
            color: 'white',
            borderColor: '#666ad1'
        };
        const searchControlsStyle = {
            textAlign: 'left',
            margin: '2px',
            padding: '5px',
            backgroundColor: '#eeeeee',
            verticalAlign: 'top',
            height: '100%'
        };
        const iconsStyle = {
            padding: '0px 5px',
            cursor: 'pointer'
        }
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
        const documentViewStyle = {
            textAlign: 'left',
            margin: '2px',
            padding: '5px 5px 5px 2px',
            verticalAlign: 'top',
            borderLeft: '3px solid #303f9f'
        };

        const headingStyle = {
            cursor: 'pointer',
            margin: '0px',
            fontSize: '14px'
        }
        const idStyle = {
            color: '#001970',
            fontWeight: 'bold'
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
                        Language
                        <div
                            className="border rounded">
                            <Dropdown value="English"
                                      options={this.state.languages}
                                      onChange={this.handleLanguageChange}
                            />
                        </div>
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
                        Document Type
                        <div
                            className="border rounded">
                            <Dropdown
                                options={this.state.documentTypes}
                                onChange={this.handleDocumentTypeChange}
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
                                    className="mt-2 btn" style={submitBtnStyle}>Search</Button>
                            &nbsp;
                            &nbsp;
                            <Button type="button" onClick={this.handleExport}
                                    className="mt-2 btn btn-secondary" >Export</Button>
                        </form>
                    </div>

                </div>
                <div style={searchResultsStyle} className={resultsWidth}>
                    <pre
                        style={searchHitsStyle}
                        className="">{totalHits != null ? (searchDisplayQuery + totalHits + " results") : ""}</pre>
                    {(listItems != null && listItems.length > 0) ? listItems.map(item => (

                        <div key={item.ID} style={documentStyle}>
                            <hr className="my-1"/>
                            <div className="row">
                                <div className="col-lg-11">
                                    <a onClick={this.openDocument} data-external-url={item.EXTERNALURL}>
                                        <div style={headingStyle}>
                            <span
                                style={idStyle}>{item.KCEXTERNALID}</span> <span
                                            dangerouslySetInnerHTML={{__html: item.KCTITLE}}/> <span
                                            dangerouslySetInnerHTML={{__html: item.KCTITLE_JPN_JP}}/>
                                        </div>
                                    </a></div>
                                <div className="col-lg-1" style={iconsStyle}><a onClick={this.openJSON}
                                                                                data-doc-id={item.ID}><img src="img/knowledge.png" height="20px"/>
                                </a></div>
                            </div>

                            <div
                                style={descriptionStyle}> <span
                                dangerouslySetInnerHTML={{__html: item.CONTENT}}/> <span
                                dangerouslySetInnerHTML={{__html: item.CONTENT_JPN_JP}}/></div>

                        </div>
                    )) : <pre> {listLoaded ? "No records found" : "Please wait.. "}</pre>}
                    {totalHits > loadedDocumentsCount ?
                        <a onClick={this.loadMore} className="btn btn-secondary">Load More</a> : null}
                </div>
                <div style={documentViewStyle} className={documentWidth}
                     dangerouslySetInnerHTML={{__html: currentDocument}}>
                </div>
            </div>
        );
    }
}

export default LoadDocuments;