import React, {useRef} from 'react';
import Button from 'react-bootstrap/Button';
import CheckboxTree from 'react-checkbox-tree';
import Chips from 'react-chips'
import Urls from './Urls'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import {saveAs} from 'file-saver';
import {FormCheck, Modal} from "react-bootstrap";
import Autosuggest from 'react-autosuggest';

import {
    Accordion, AccordionItem, AccordionItemButton, AccordionItemHeading, AccordionItemPanel,
} from 'react-accessible-accordion';
import Cookies from "universal-cookie";
import ReactCloseableTabs from "./ReactCloseableTabs";

class LoadDocuments extends React.Component {

    constructor(props) {
        super(props);
        this.searchControlsColumnRef = React.createRef();
        this.searchResultsColumnRef = React.createRef();
        this.openDocumentColumnRef = React.createRef();
        this.searchBoxRef = React.createRef();

        this.state = {
            autoSuggestionString: '',
            showProfile: false,
            isDocumentViewFullScreen: false,
            userProfile: {},
            microsites: [],
            allMicrosites: [],
            userSegments: [],
            userAccessLevels: [],
            currentMicrosite: '',
            buckets: [],
            activeIndex: 0,
            tabs: [],
            checkedEntitlements: [],
            expandedEntitlements: ['Entitlements'],
            entitlementNodes: [],
            checkedEnterpriseSegments: [],
            expandedEnterpriseSegments: [],
            enterpriseSegmentsNodes: [],
            documentTypes: [],
            sortFieldsTypes: [],
            sortOrderTypes: [],
            languageSelectionTypes: [],
            documentLanguages: [],
            checkedDocumentLanguages: [],
            expandedDocumentLanguages: [],
            editionLanguages: [],
            checkedEditionLanguages: [],
            expandedEditionLanguages: [],
            suggestions: [],
            checkedProducts: [],
            productsMap: {},
            productsReverseMap: {},
            entitlementsMap: {},
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
            searchDisplayQuery: null,
            selectedDocumentID: -1,
            sortField: '',
            value: '',
            sortOrder: 1,
            languageSelectionType: 'Selected',
            languageSelectionTypeValue: 'Selected languages below',
            debug: false
        };
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.loadList = this.loadList.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.openDocument = this.openDocument.bind(this);
        this.openJSON = this.openJSON.bind(this);
        this.closeSideWindow = this.closeSideWindow.bind(this);
        this.closeAllTabs = this.closeAllTabs.bind(this);
        this.documentViewFullScreen = this.documentViewFullScreen.bind(this);
        this.onProductsChange = this.onProductsChange.bind(this);
        this.handleDocumentTypeChange = this.handleDocumentTypeChange.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.handleSortField = this.handleSortField.bind(this);
        this.handleSortOrder = this.handleSortOrder.bind(this);
        this.handleLanguageSelectionType = this.handleLanguageSelectionType.bind(this);
        this.debugChanged = this.debugChanged.bind(this);
        this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
        this.chooseMicrosite = this.chooseMicrosite.bind(this);
        this.chooseBucketKeyword = this.chooseBucketKeyword.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.logout = this.logout.bind(this);
        this.addTab = this.addTab.bind(this);
        this.showFilters = this.showFilters.bind(this);
        this.closeFilters = this.closeFilters.bind(this);
        this.getMicrositeLanguage = this.getMicrositeLanguage.bind(this);
        this.getMetadata1 = this.getMetadata1.bind(this);
        this.getMetadata2 = this.getMetadata2.bind(this);
    }


    getMicrositeLanguage(currentMicrosite) {
        return this.state.allMicrosites.filter(microsite => microsite['id'] === currentMicrosite['id'])[0]['attributes'].filter(attribute => attribute['name'] === 'MS_Language')[0]['value'];
    }

    chooseMicrosite(event) {
        this.setState({
            currentMicrosite: event.currentTarget.getAttribute("data-microsite-id"),
            languageSelectionType: 'Selected',
            languageSelectionTypeValue: 'Selected languages below',
            checkedDocumentLanguages: [event.currentTarget.getAttribute("data-default-language")]
        }, () => this.loadList(0));
        console.log('Microsite changed to ' + event.currentTarget.getAttribute("data-microsite-id") + " with language " + event.currentTarget.getAttribute("data-default-language"));
    }

    onProductsChange = checkedProducts => {
        this.setState({checkedProducts});
    }

    logout(event) {
        const cookies = new Cookies();
        cookies.remove('user');
        this.props.history.push('/');
    }

    handleLanguageChange(event) {
        this.setState({selectedLanguage: event.value})
    }

    handleDocumentTypeChange(event) {
        this.setState({selectedDocumentType: event.value})
    }

    handleSortField(event) {
        this.setState({sortField: event.value}, () => this.loadList(0));
    }

    handleSortOrder(event) {
        this.setState({sortOrder: event.value}, () => this.loadList(0));
    }

    handleLanguageSelectionType(event) {
        this.setState({languageSelectionType: event.value})
    }

    handleSearchChange(event) {
        this.setState({value: event.target.value, searchString: event.target.value});
    }

    onKeyUp(event) {
        if (event.key === ' ') {
            this.loadList(0);
        }
    }

    openDocument(event) {
        event.preventDefault();
        this.setState({
            selectedDocumentID: -1
        });
        let url = event.currentTarget.getAttribute("data-external-url");
        let docID = event.currentTarget.getAttribute("data-doc-id");
        let fileName = url.substring(url.indexOf("Publishing/") + "Publishing/".length);
        console.log("Called open Document " + fileName);
        fetch(Urls.OPEN_DOCUMENT, {
            method: 'post', body: JSON.stringify({
                "fileName": fileName
            })
        })
            .then((result) => {
                if (result.status === 200) {
                    result.text().then((text) => {
                        text = text.replace("{ background-color: #6699CC; font-size: 12px; color: #ffffff; font-weight: bold; }", "{ background-color: #41a4ff22; font-size: 14px; color: black; font-weight: bold; font-family : 'Roboto'}")
                        text = text.replace(".date\t \t{font-size:12px;color:#FFFFFF;font-weight:normal;}", ".date\t \t{font-size:12px;color:black;font-weight:normal;}")
                        text = text.replace(".date_bold \t{font-size:12px;color:#FFFFFF;font-weight:bold;}", ".date_bold \t{font-size:12px;color:black;font-weight:bold;}")
                        text = text.replace(".document_title {font-size: 18px; color: #0E5899; font-weight: bold; }", ".document_title {font-size: 18px; color: #298ae5; font-weight: bold; }")
                        text = text.replace("body\t\t{font-family: Arial Unicode MS,verdana,helvetica,sans-serif;  margin: 0px 0px 0px 0px; font-size:12px;}", "")
                        text = text.replace("select,option  { font-family: Arial Unicode MS,verdana,helvetica; font-size: 12px; font-weight: normal;};", "")
                        text = text.replaceAll("viewdoc_tab.gif", "viewdoc_tab.png")

                        this.addTab(docID, text, docID);
                        this.searchResultsColumnRef.current.className = 'search_results_hide';
                        this.openDocumentColumnRef.current.className = 'open_document_show';
                    });
                }
            }, (error) => {
                this.setState({
                    currentDocument: "", error
                });
            })
    }

    addTab(selectedDocumentID, text, docID) {
        let newTabs = this.state.tabs;
        const id = new Date().valueOf();
        console.log("New Tabs before add ");
        newTabs.map((value) => console.log(value.id + " " + value.tab));
        newTabs = newTabs.filter(item => item.tab !== docID);
        newTabs = newTabs.concat({
            tab: docID,
            component: (
                <div style={{maxWidth: '100%', overflowY: 'scroll'}} dangerouslySetInnerHTML={{__html: text}}/>
            ),
            id: id,
            closeable: true
        });
        console.log("New Tabs after add ");
        newTabs.map((value) => console.log(value.id + " " + value.tab));
        this.setState({
            selectedDocumentID: selectedDocumentID,
            tabs: newTabs,
            activeIndex: newTabs.length - 1
        })
    }

    closeSideWindow(event) {
        if (event !== undefined) event.preventDefault();
        this.searchResultsColumnRef.current.className = 'search_results_show';
        this.openDocumentColumnRef.current.className = 'open_document_hide';
        this.searchControlsColumnRef.current.className = 'search_controls_show';
        this.setState({
            isDocumentViewFullScreen: false
        });
    }

    closeAllTabs(event) {
        if (event !== undefined) event.preventDefault();
        this.setState({
            selectedDocumentID: -1,
            tabs: []
        });
        this.searchResultsColumnRef.current.className = 'search_results_show';
        this.openDocumentColumnRef.current.className = 'open_document_hide';
        this.searchControlsColumnRef.current.className = 'search_controls_show';
        this.setState({
            isDocumentViewFullScreen: false
        });
    }

    documentViewFullScreen(event) {
        if (event !== undefined) event.preventDefault();
        if (this.state.isDocumentViewFullScreen) {
            this.searchResultsColumnRef.current.className = 'search_results_hide';
            this.openDocumentColumnRef.current.className = 'open_document_show';
            this.searchControlsColumnRef.current.className = 'search_controls_show';
        } else {
            this.searchControlsColumnRef.current.className = 'search_controls_hide';
            this.searchResultsColumnRef.current.className = 'search_results_hide_full';
            this.openDocumentColumnRef.current.className = 'open_document_show_full';
        }
        this.setState({
            isDocumentViewFullScreen: !this.state.isDocumentViewFullScreen
        });
    }

    openJSON(event) {
        event.preventDefault();
        this.setState({
            selectedDocumentID: -1
        });
        let docId = event.currentTarget.getAttribute("data-doc-id");
        fetch(Urls.OPEN_DOCUMENT, {
            method: 'post', body: JSON.stringify({
                "docId": docId
            })
        })
            .then((result) => {
                if (result.status === 200) {
                    result.json().then((json) => {
                        let formattedJSON = '<pre>' + JSON.stringify(json, null, 2) + '</pre>';
                        this.addTab(docId, formattedJSON, docId + "_json");
                        this.searchResultsColumnRef.current.className = 'search_results_hide';
                        this.openDocumentColumnRef.current.className = 'open_document_show';
                    });
                }
            }, (error) => {
                this.setState({
                    currentDocument: "", error
                });
            })
    }

    showFilters(event) {
        this.searchControlsColumnRef.current.className = '';
        this.searchControlsColumnRef.current.style.display = 'table-cell';
        this.searchResultsColumnRef.current.className = 'search_results_hide';
        this.openDocumentColumnRef.current.className = 'open_document_hide';
    }

    closeFilters(event) {
        this.searchControlsColumnRef.current.className = '';
        this.searchControlsColumnRef.current.style.display = 'none';
        this.searchResultsColumnRef.current.className = 'search_results_show';
        this.openDocumentColumnRef.current.className = 'open_document_hide';
    }

    debugChanged(event) {
        this.setState({
            debug: event.target.value === "on"
        });
        event.preventDefault();
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
        const cookies = new Cookies();
        if (cookies.get('user') === null || cookies.get('user') === undefined) {
            this.props.history.push('/');
            return;
        }
        this.loadAllMicrosites();
    }

    loadAllMicrosites() {
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=MS_root", {
            method: 'get'
        })
            .then((result) => {
                if (result.status === 200) {
                    result.json().then(result => {
                        console.log()
                        this.setState({
                            allMicrosites: result
                        });
                        const cookies = new Cookies();
                        this.setState({
                            userProfile: cookies.get('user'),
                            microsites: cookies.get('user')['microsites'],
                            userSegments: cookies.get('user')['segments'],
                            userAccessLevels: cookies.get('user')['accessLevels'],
                            currentMicrosite: cookies.get('user')['microsites'][0].id
                        }, () => {
                            this.loadEntitlements();
                        });

                    });
                }
            });
    }

    loadEntitlements() {
        if (this.state.staticDataLoaded) return;
        this.setState({staticDataLoaded: true});
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=SAL_root", {
            method: 'get'
        })
            .then((result) => {
                if (result.status === 200) {
                    result.json().then(result => {
                        let entitlementsMapTemp = result.reduce(function (map, concept) {
                            map[concept.id] = concept.names['LA_eng_US'];
                            return map;
                        }, {});
                        let nodesTemp = result.map(concept => {
                            return {
                                value: concept.id, label: concept.names['LA_eng_US'].replace(/(.{15})..+/, "$1..")
                            };
                        });
                        nodesTemp.sort(this.sortNames);
                        this.setState({
                            entitlementsMap: entitlementsMapTemp,
                            checkedEntitlements: this.state.userAccessLevels,
                            entitlementNodes: [{
                                value: 'Entitlements', label: 'Entitlements', children: nodesTemp
                            }]
                        });
                        this.loadProducts();
                        this.loadEnterpriseSegments();
                        this.loadDocumentTypes();
                        this.loadLanguages();
                        this.loadSortFieldsTypes();
                        this.loadSortOrderTypes();
                        this.loadLanguageSelectionTypes();
                    });
                }
            })
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
            .then((result) => {
                if (result.status === 200) {
                    result.json().then(result => {
                        let userSegments = this.state.userSegments;
                        let segmentSummaryMap = {};
                        let selectedSegmentsNodes = [];
                        for (let i = 0; i < userSegments.length; i++) {
                            let segment = userSegments[i];
                            if (segment.indexOf("_") !== -1) {
                                let prefix = segment.substring(0, segment.indexOf("_"));
                                if (segmentSummaryMap[prefix] === undefined) {
                                    segmentSummaryMap[prefix] = [];
                                }
                                segmentSummaryMap[prefix].push(segment);
                                selectedSegmentsNodes.push(segment);
                            }
                        }
                        for (let j = 0; j < result.length; j++) {
                            let enterpriseSegmentKey = result[j].value;
                            let enterpriseSegmentPrefix = enterpriseSegmentKey.substring(0, enterpriseSegmentKey.indexOf("_"));
                            if (segmentSummaryMap[enterpriseSegmentPrefix] !== undefined) {
                                result[j].children = result[j].children.filter(e => segmentSummaryMap[enterpriseSegmentPrefix].includes(e.value));
                            }
                        }
                        this.setState({
                            checkedEnterpriseSegments: selectedSegmentsNodes,
                            enterpriseSegmentsNodes: result,
                            checkedDocumentLanguages: [this.getMicrositeLanguage(this.state.microsites[0])]
                        });
                        this.loadList(0);
                    });
                }
            })
    }

    loadDocumentTypes() {
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=DT_DocType", {
            method: 'get'
        })
            .then((result) => {
                if (result.status === 200) {
                    result.json().then(result => {
                        let nodesTemp = result.map(concept => {
                            return {
                                value: concept.id, label: concept.names['LA_eng_US']
                            };
                        })
                        nodesTemp.sort(this.sortNames);
                        this.setState({
                            documentTypes: nodesTemp
                        });
                    });
                }
            })
    }

    loadLanguages() {
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=LA_root", {
            method: 'get'
        })
            .then((result) => {
                if (result.status === 200) {
                    result.json().then(result => {
                        let nodesTemp = result.map(concept => {
                            return {
                                value: concept.id, label: concept.names['LA_eng_US']
                            };
                        })
                        nodesTemp.sort(this.sortNames)
                        this.setState({
                            documentLanguages: [{
                                value: 'documentLanguages',
                                label: 'Select Language', children: nodesTemp
                            }],
                            editionLanguages: [{
                                value: 'editionLanguages', label: 'Select Language', children: nodesTemp
                            }]
                        })
                    });
                }
            })
    }

    loadSortFieldsTypes() {
        let sortFields = [];
        sortFields = sortFields.concat({value: 'PUBLICATIONSTATUS', label: 'Publication Status'})
        sortFields = sortFields.concat({value: 'DOCLASTMODIFIEDDATE', label: 'Last Modified'})
        sortFields = sortFields.concat({value: 'RATINGCOUNT', label: 'Rating Count'})
        sortFields = sortFields.concat({value: '', label: 'Relevance'})
        this.setState({sortFieldsTypes: sortFields})
    }

    loadSortOrderTypes() {
        this.setState({sortOrderTypes: [{value: 1, label: 'asc'}, {value: 0, label: 'desc'}]})
    }

    loadLanguageSelectionTypes() {
        this.setState({
            languageSelectionTypes: [{value: 'All', label: 'All languages'}, {
                value: 'Selected', label: 'Selected languages below'
            }, {value: 'Query', label: 'By determining query language'}]
        })
    }


    loadProducts() {
        fetch(Urls.GET_TAXONOMIES + "action=getTaxoConcepts&param1=SG_root", {
            method: 'get'
        })
            .then((result) => {
                if (result.status === 200) {
                    result.json().then(result => {
                        let productsMapTemp = result.reduce(function (map, concept) {
                            map[concept.names['LA_eng_US']] = concept.id;
                            return map;
                        }, {});
                        let productsReverseMapTemp = result.reduce(function (map, concept) {
                            map[concept.id] = concept.names['LA_eng_US'];
                            return map;
                        }, {});
                        let nodesTemp = Object.keys(productsMapTemp);
                        this.setState({
                            productsMap: productsMapTemp,
                            productNodes: nodesTemp,
                            productsReverseMap: productsReverseMapTemp
                        });
                    });
                }
            })
    }

    loadMore() {
        this.loadList(this.state.loadedDocumentsCount);
    }

    loadAutoSuggestionFields(autoSuggestionString) {
        this.setState({
            autoSuggestionString: autoSuggestionString
        })
        fetch(Urls.GET_AUTO_SUGGESTIONS, {
            method: 'post', body: JSON.stringify({
                "query": autoSuggestionString
            })
        }).then((result) => {
            if (result.status === 200) {
                result.json().then(result => {
                    if (this.state.autoSuggestionString !== autoSuggestionString) return;
                    let nodesTemp = result.map(concept => {
                        return {
                            value: concept, label: concept
                        };
                    })
                    nodesTemp.sort(this.sortNames);
                    this.setState({
                        suggestions: nodesTemp
                    });
                });
            }
        })
    }

    loadList(startKCNum, exportDoc = false) {
        if (this.state.languageSelectionType === 'Query' && this.state.searchString.trim().length === 0) {
            alert("Please enter a query for searching.");
            return;
        }

        if (this.state.languageSelectionType === 'Selected' && this.state.checkedDocumentLanguages.length === 0) {
            alert("Please choose at least one language.");
            return;
        }

        if (startKCNum === 0 && exportDoc === false) {
            this.setState({
                loadedDocumentsCount: 1
            })
            this.setState({
                listItems: [],
                listLoaded: false,
                totalHits: null,
                searchDisplayQuery: ""// "Microsite = " + (this.state.currentMicrosite) + "\nEntitlements = " + (this.state.checkedEntitlements.length > 0 ? this.state.checkedEntitlements.join(",") : "SAL_root") + "\nSegments = " + (this.state.checkedEnterpriseSegments.length > 0 ? this.state.checkedEnterpriseSegments.join(",") : "NONE") + "\nProducts = " + (this.state.checkedProducts.length > 0 ? this.state.checkedProducts.join(",") : "NONE") + "\nQuery = " + (this.state.searchString ? this.state.searchString : "NONE") + "\nreturned "
            });
        }
        let documentIdMap = {
            "DT_DL_1": "10",
            "DT_HOWTO_1": "9",
            "DT_REFERENCE_1": "8",
            "DT_KNOWNERROR_1": "7",
            "DT_PROBLEMSOLUTION_1": "6",
            "DT_Case": "-1",
            "DT_SMART_1": "-1",
            "DT_Topic": "-1",
            "DT_Insight": "-1",
            "DT_IQR_1": "-1",
            "DT_Article": "-1",
            "DT_QU_1": "-1",
        };
        //TODO Need to remove this hardCoding
        let constraintChildren = [{
            "operation": "Or", "children": [{
                "operation": "Equal", "attributeType": "integer", "attributeName": "RATINGCOUNT", "value": "0"
            }, {
                "operation": "Less", "attributeType": "integer", "attributeName": "RATING", "value": "125"
            }]
        }];
        if (this.state.selectedDocumentType !== '' && this.state.selectedDocumentType !== '' && documentIdMap[this.state.selectedDocumentType] !== null && documentIdMap[this.state.selectedDocumentType] !== undefined) {
            constraintChildren = constraintChildren.concat({
                "operation": "Equal",
                "attributeType": "integer",
                "attributeName": "TEMPLATEID",
                "value": documentIdMap[this.state.selectedDocumentType]
            });
        }
        if (this.state.checkedEditionLanguages.length > 0) {
            let editionLanguagesChildren = [];
            this.state.checkedEditionLanguages.forEach((language) => {
                editionLanguagesChildren = editionLanguagesChildren.concat({
                    "operation": "Contains",
                    "attributeType": "text",
                    "attributeName": "EDITIONSLANGS",
                    "containsValue": "AllOf",
                    "value": language
                })
            })
            constraintChildren = constraintChildren.concat({
                "operation": "Or", "children": editionLanguagesChildren
            })
            console.log(constraintChildren)
        }
        fetch(Urls.DOCUMENT_SEARCH, {
            method: 'post', body: JSON.stringify({
                "searchParams": {
                    "userQuery": this.state.searchString,
                    "entitlements": this.state.checkedEntitlements.length > 0 ? this.state.checkedEntitlements.join(",") : "SAL_root",
                    "segments": this.state.checkedEnterpriseSegments.length > 0 ? this.state.checkedEnterpriseSegments.join(",") : null,
                    "products": this.state.checkedProducts.length > 0 ? this.state.checkedProducts.map(chip => this.state.productsMap[chip]).join(",") : null,
                    "microsite": this.state.currentMicrosite,
                    "numKCs": exportDoc ? 500 : 30,
                    "startKCNum": startKCNum,
                    "sortField": this.state.sortField,
                    "sortOrder": this.state.sortOrder,
                    "languageSelectionType": this.state.languageSelectionType,
                    "selectedLanguages": this.state.checkedDocumentLanguages.length > 0 ? this.state.checkedDocumentLanguages.join(",") : "",
                    "constraints": {
                        "operation": "And", "children": constraintChildren
                    }
                }, "export": exportDoc, "debug": this.state.debug
            })
        })
            .then((result) => {
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
                            let validBuckets = result.buckets.filter(e => result.totalHits !== 10000 && e.count >= 0.2 * result.totalHits && e.count <= 0.6 * result.totalHits).slice(0, 20);
                            if (validBuckets.length === 0) {
                                validBuckets = result.buckets.filter(e => result.totalHits !== 10000 && e.count >= 0.1 * result.totalHits && e.count <= 0.8 * result.totalHits).slice(0, 20);
                            }
                            this.setState({
                                listLoaded: true,
                                totalHits: result.totalHits,
                                buckets: this.state.searchString !== '' ? validBuckets : [],
                                listItems: this.state.listItems.concat(result.hits),
                                loadedDocumentsCount: this.state.loadedDocumentsCount + result.hits.length
                            }, () => {
                                if (this.state.isDocumentViewFullScreen) {
                                    this.documentViewFullScreen();
                                }
                            });
                            if (this.state.debug) {
                                let formattedJSON = '<pre style="font-size: 11px">' + JSON.stringify({"query": result.query}, null, 2) + '</pre>';
                                this.addTab(-1, formattedJSON, "Query JSON")
                                this.searchResultsColumnRef.current.className = 'search_results_hide';
                                this.openDocumentColumnRef.current.className = 'open_document_show';
                            }
                        });
                    } else {
                        this.setState({
                            listLoaded: true, error: {'message': 'Failed to load data. Unknown error occurred'}
                        });
                    }
                }, // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        listLoaded: true, error
                    });
                })
    }

    onSuggestionsFetchRequested = ({value}) => {
        this.loadAutoSuggestionFields(value);
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    getMetadata1(item) {
        let result = "Product: "
        result += item.TAGS.filter(tag => tag.startsWith("SG_")).map(tag => this.state.productsReverseMap[tag]).join(", ");
        return result;
    }

    getMetadata2(item) {
        let result = "Initial Published Date : " + this.formatDate(item.CREATEDDATE) + " | Last Modified Date : " + this.formatDate(item.DOCLASTMODIFIEDDATE) + " | Published : " + this.formatDate(item.PUBLISHEDDATE);
        result += " | Access Levels: "
        result += item.TAGS.filter(tag => tag.startsWith("SAL_")).map(tag => this.state.entitlementsMap[tag]).join(", ");
        return result;
    }

    formatDate(date) {
        return new Date(Date.parse(date)).toLocaleDateString('en-US');
    }

    onSuggestionSelected(event, {suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) {
        this.setState({
            searchString: suggestion.label + ' ',
            value: suggestion.label + ' '
        }, function () {
            this.loadList(0);
        });
    }

    chooseBucketKeyword(event) {
        let bucketKey = event.currentTarget.getAttribute("data-bucket-key");
        this.setState({
            searchString: this.state.searchString.trim() + ' ' + bucketKey,
            value: this.state.searchString.trim() + ' ' + bucketKey,
        }, function () {
            this.loadList(0);
        });
    }

    getSuggestionValue = suggestion => suggestion.name;

    renderSuggestion = suggestion => (
        <div style={{padding: '2px', fontSize: '16px'}}>{suggestion.label}</div>
    );

    clearSearch() {
        this.setState({value: '', searchString: ''}, () => {
            this.searchBoxRef.current.focus();
        });

    }

    renderInputComponent = inputProps => (
        <div className="form-control p-1">
            <table style={{width: '100%', backgroundColor: 'white'}}>
                <tbody>
                <tr>
                    <td style={{width: '100%'}}><input type="search" {...inputProps}
                                                       autoComplete="off"
                                                       ref={this.searchBoxRef}
                                                       className="search_input"
                                                       id="search"/></td>
                    <td style={{textAlign: 'right'}}><a style={{color: '#dddddd'}} onClick={this.clearSearch}
                                                        className="clear_search"><i
                        className="fa fa-times-circle"/></a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );

    renderSuggestionsContainer({containerProps, children, query}) {
        return (
            <div {...containerProps}>
                {children}
            </div>
        );
    }

    handleUserProfileModal() {
        this.setState({showProfile: !this.state.showProfile})
    }

    render() {
        const {
            error,
            isLoaded,
            userProfile,
            listLoaded,
            listItems,
            totalHits,
            buckets,
            loadedDocumentsCount,
            searchDisplayQuery,
            currentDocument,
            selectedDocumentID,
            suggestions,
            value,
            microsites,
            currentMicrosite,
            tabs,
            viewDocumentFullScreen
        } = this.state;

        const selectedMicrositeStyle = {
            color: '#ff984d', fontSize: '12px', fontWeight: 'bold', lineHeight: '120%', margin: 0
        };
        const micrositeStyle = {
            color: 'black',
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: '120%',
            margin: 0,
            textDecorationStyle: 'underline'
        };

        const searchControlsStyle = {
            textAlign: 'left',
            margin: '0px',
            padding: '0px',
            verticalAlign: 'top',
            fontSize: '16px',
            height: '100%'
        };
        const iconsStyle = {
            padding: '0px 5px', cursor: 'pointer'
        }
        const bucketKeyStyle = {
            padding: '5px', cursor: 'pointer',
            fontSize: '14px', fontFamily: 'Roboto'
        }
        const selectedDocumentStyle = {
            textAlign: 'left', verticalAlign: 'top', padding: '12px',
            margin: '0px 5px 12px 0px',
            backgroundColor: '#41a4ff11',
            borderRadius: '5px'
        };
        const documentStyle = {
            textAlign: 'left',
            verticalAlign: 'top',
            padding: '12px',
            margin: '0px 5px 12px 0px',
            wordBreak: 'break-all'
        };

        const searchResultsStyle = {
            textAlign: 'left', margin: '0px', padding: '0px', verticalAlign: 'top'
        };
        const documentViewStyle = {
            textAlign: 'left',
            verticalAlign: 'top'
        };

        const headingStyle = {
            cursor: 'pointer', margin: '0px', fontSize: '14px'
        }
        const idStyle = {
            color: '#298ae5', fontSize: '16px'
        };
        const nameStyle = {
            color: '#298ae5', fontWeight: 'bold', textTransform: 'capitalize'

        };
        const descriptionStyle = {
            overflow: 'hidden', fontSize: '16px', textOverflow: 'ellipsis'
        }
        const metadataStyle = {
            fontSize: '16px', color: 'grey', paddingTop: '5px'
        }
        const entitlementStyle = {
            height: '200px', backgroundColor: 'white', overflowY: 'scroll'
        };
        const chipsStyle = {};
        const inputProps = {
            placeholder: 'Type a search word',
            onChange: this.handleSearchChange,
            onKeyUp: this.onKeyUp,
            value
        };

        return (<div>
                <table style={{width: '100%', height: '100px', backgroundColor: '#41a4ff33'}}
                       className="header_desktop">
                    <tbody>
                    <tr>
                        <td style={{width: '20%', padding: '20px'}}><img src="img/kiku_logo.png"
                                                                         style={{height: '40px'}}
                                                                         alt="Kiku Logo"/></td>
                        <td style={{width: '65%'}}>
                            <form onSubmit={this.handleSubmit}>

                                <table style={{width: '100%'}}>
                                    <tbody>
                                    <tr>
                                        <td style={{width: '60%'}}>
                                            <Autosuggest
                                                suggestions={suggestions}
                                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                                getSuggestionValue={this.getSuggestionValue}
                                                renderSuggestion={this.renderSuggestion}
                                                renderInputComponent={this.renderInputComponent}
                                                renderSuggestionsContainer={this.renderSuggestionsContainer}
                                                onSuggestionSelected={this.onSuggestionSelected}
                                                inputProps={inputProps}
                                            />
                                        </td>
                                        <td>
                                            <Button type="submit" onClick={this.handleSubmit}
                                                    className="mt-2 btn m-2 submit_button"
                                            >Search</Button>
                                            <Button type="button" onClick={this.handleExport}
                                                    className="mt-2 btn btn-secondary m-2">Export</Button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                            </form>
                        </td>
                        <td style={{textAlign: 'right', padding: '8px'}}>
                            <h6 style={nameStyle}>{userProfile.firstname} {userProfile.lastname}</h6>
                            <a href="#" onClick={() => this.handleUserProfileModal()}>Profile</a> | <a
                            href="#"
                            onClick={this.logout}>Logout</a>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table style={{width: '100%', backgroundColor: '#41a4ff33'}} className="header_mobile">
                    <tbody>
                    <tr>
                        <td style={{width: '40%', padding: '15px'}}><img src="img/kiku_logo.png"
                                                                         style={{height: '20px'}}
                                                                         alt="Kiku Logo"/></td>
                        <td style={{textAlign: 'right', padding: '6px', width: '60%'}}>
                            <h6 style={nameStyle}>{userProfile.firstname} {userProfile.lastname}</h6>
                            <a href="#" onClick={() => this.handleUserProfileModal()}>Profile</a> | <a
                            href="#"
                            onClick={this.logout}>Logout</a>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <form onSubmit={this.handleSubmit}>

                                <table style={{width: '100%'}}>
                                    <tbody>
                                    <tr>
                                        <td style={{width: '80%', paddingLeft: '5px'}}>
                                            <Autosuggest
                                                suggestions={suggestions}
                                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                                getSuggestionValue={this.getSuggestionValue}
                                                renderSuggestion={this.renderSuggestion}
                                                renderInputComponent={this.renderInputComponent}
                                                renderSuggestionsContainer={this.renderSuggestionsContainer}
                                                onSuggestionSelected={this.onSuggestionSelected}
                                                inputProps={inputProps}
                                            />
                                        </td>
                                        <td>
                                            <Button type="submit" onClick={this.handleSubmit}
                                                    className="mt-1 btn m-1 submit_button"
                                            ><i className="fa fa-search"></i></Button>

                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <a style={{color: '#298ae5', fontSize: '14px', padding: '5px'}}
                                   onClick={this.showFilters}>Additional
                                    Filters</a>

                            </form>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <Modal show={this.state.showProfile} onHide={() => this.handleUserProfileModal()}>
                    <Modal.Header closeButton>User Profile</Modal.Header>
                    <Modal.Body>
                        <h4 style={nameStyle}>{userProfile.firstname} {userProfile.lastname}</h4>
                        <h6>{userProfile.username}</h6>
                        <br/>
                        <b>Knowledge
                            Panel</b> {this.state.microsites.map((t) => t['names']['LA_eng_US']).join(", ")}<br/>
                        <b>Entitlements</b> {this.state.userAccessLevels.join(", ")}<br/>
                        <b>Segments</b> {this.state.userSegments.join(", ")}<br/></Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.handleUserProfileModal()}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <table style={{width: '100%'}}>
                    <tbody>
                    <tr>
                        <td style={searchControlsStyle} id="search_controls_column" ref={this.searchControlsColumnRef}>
                            <Accordion allowZeroExpanded={true}
                                       allowMultipleExpanded={true}
                                       preExpanded={['suggestions']}>
                                <a className="show_in_mobile" style={{
                                    fontSize: '16px',
                                    fontFamily: 'Roboto',
                                    padding: '8px',
                                    color: '#298ae5'
                                }} onClick={this.closeFilters}><i className="fa fa-times-circle"/> Close Filters
                                </a>

                                {buckets.length !== 0 ? <AccordionItem uuid='suggestions'>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Suggestions
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <div style={{backgroundColor: 'white'}}>
                                            {buckets.map(bucket =>
                                                <div style={bucketKeyStyle}>
                                                    <a
                                                        key={bucket.key}
                                                        data-bucket-key={bucket.key}
                                                        onClick={this.chooseBucketKeyword}>{bucket.key} ({bucket.count})</a>
                                                </div>)}
                                        </div>

                                    </AccordionItemPanel>
                                </AccordionItem> : <span></span>}
                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Knowledge Group
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        {microsites.map(item =>
                                            <a
                                                key={item.id}
                                                style={(item.id === currentMicrosite) ? selectedMicrositeStyle : micrositeStyle}
                                                onClick={this.chooseMicrosite}
                                                data-default-language={this.getMicrositeLanguage(item)}
                                                data-microsite-id={item.id}>{item.names['LA_eng_US']} &nbsp;</a>)}
                                    </AccordionItemPanel>
                                </AccordionItem>
                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Languages
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        Search from
                                        <Dropdown value={this.state.languageSelectionTypeValue}
                                                  options={this.state.languageSelectionTypes}
                                                  onChange={this.handleLanguageSelectionType}
                                        ></Dropdown>
                                        Select Languages
                                        <div style={entitlementStyle}
                                             className="border rounded">
                                            <CheckboxTree
                                                iconsClass="fa5"
                                                showNodeIcon={false}
                                                nodes={this.state.documentLanguages}
                                                checked={this.state.checkedDocumentLanguages}
                                                expanded={this.state.expandedDocumentLanguages}
                                                onCheck={checked => this.setState({checkedDocumentLanguages: checked})}
                                                onExpand={expanded => this.setState({expandedDocumentLanguages: expanded})}
                                            />
                                        </div>
                                        Edition Languages
                                        <div style={entitlementStyle}
                                             className="border rounded">
                                            <CheckboxTree
                                                iconsClass="fa5"
                                                showNodeIcon={false}
                                                nodes={this.state.editionLanguages}
                                                checked={this.state.checkedEditionLanguages}
                                                expanded={this.state.expandedEditionLanguages}
                                                onCheck={checked => this.setState({checkedEditionLanguages: checked})}
                                                onExpand={expanded => this.setState({expandedEditionLanguages: expanded})}
                                            />
                                        </div>
                                    </AccordionItemPanel>
                                </AccordionItem>
                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Segment Metadata
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <div style={{display: 'none'}}>
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
                                    </AccordionItemPanel>
                                </AccordionItem>
                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Others
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <FormCheck name="Debug" title="Debug" onChange={this.debugChanged}
                                                   label="Show Opensearch Query"/>
                                    </AccordionItemPanel>
                                </AccordionItem>
                            </Accordion>
                        </td>
                        <td style={searchResultsStyle} ref={this.searchResultsColumnRef}>
                            <div className="search_results">
                                <table style={{
                                    width: '100%',
                                    display: (totalHits != null && totalHits > 0) ? 'table' : 'none'
                                }}>
                                    <tbody>
                                    <tr>
                                        <td style={{width: '30%'}}>
                                            <pre
                                                className="results_count">{totalHits != null ? (searchDisplayQuery + (totalHits === 10000 ? (totalHits + "+") : totalHits) + " results") : ""}</pre>
                                        </td>
                                        <td style={{
                                            width: '70%',
                                            textAlign: 'right',
                                            padding: '5px'
                                        }}
                                            className="sort_by">
                                            <Dropdown
                                                value={"Relevance"}
                                                baseClassName="InlineDropdown"
                                                options={this.state.sortFieldsTypes}
                                                onChange={this.handleSortField}/>
                                            <Dropdown value={"asc"} baseClassName="InlineDropdown"
                                                      options={this.state.sortOrderTypes}
                                                      onChange={this.handleSortOrder}
                                            /></td>
                                    </tr>
                                    </tbody>
                                </table>

                                {(listItems != null && listItems.length > 0) ? listItems.map(item => (

                                        <div key={item.ID}
                                             style={item.ID === selectedDocumentID ? selectedDocumentStyle : documentStyle}>
                                            <div className="container-fluid p-0">
                                                <div className="row">
                                                    <div className="col-lg-11" style={{textAlign: 'left'}}>
                                                        <a onClick={this.openDocument} data-external-url={item.EXTERNALURL}
                                                           data-doc-id={item.ID}>
                                                            <div style={headingStyle}>
                                <span style={idStyle}
                                      dangerouslySetInnerHTML={{__html: item.KCTITLE}}/> <span
                                                                style={idStyle}>({item.KCEXTERNALID})</span>
                                                            </div>
                                                        </a></div>
                                                    <div className="col-lg-1 show_in_desktop" style={iconsStyle}><a
                                                        onClick={this.openJSON}
                                                        data-doc-id={item.ID}><img
                                                        src="img/knowledge.png" height="20px"/>
                                                    </a></div>
                                                </div>
                                            </div>

                                            <div
                                                style={descriptionStyle}> <span
                                                dangerouslySetInnerHTML={{__html: item.CONTENT}}/></div>
                                            <div
                                                style={metadataStyle}> {this.getMetadata1(item)}<br/>{this.getMetadata2(item)}
                                            </div>

                                        </div>)) :
                                    <div> {listLoaded ? <div style={{padding: '10px'}}><h4>No records found</h4></div> :
                                        <img src="img/loading.gif" style={{margin: '20px', height: '50px'}}/>}</div>}
                                {totalHits > loadedDocumentsCount ?
                                    <a onClick={this.loadMore} className="btn btn-secondary">Load More</a> : null}</div>
                        </td>
                        <td style={documentViewStyle} ref={this.openDocumentColumnRef} className="open_document_hide">
                            <div className="open_document">
                                <div className="open_document_controls">
                                    <div>
                                        <a onClick={this.closeSideWindow}><span className="show_in_mobile"><i
                                            className="fa fa-arrow-left"/> Results</span><span
                                            className="show_in_desktop"><i
                                            className="fa fa-eye-slash"/> Hide</span>
                                        </a>
                                    </div>
                                    {tabs.length > 1 ?
                                        <div>
                                            <a onClick={this.closeAllTabs}><span><i
                                                className="fa fa-times-circle"/> Close all tabs</span>
                                            </a>
                                        </div> : ''}
                                    <div className="show_in_desktop">
                                        <a onClick={this.documentViewFullScreen}> {this.state.isDocumentViewFullScreen ?
                                            <span><i
                                                className="fa fa-compress"/>Search Results</span> : <span><i
                                                className="fa fa-expand"/>Full Width</span>}
                                        </a>
                                    </div>
                                </div>
                                {tabs.length > 0 ?
                                    <ReactCloseableTabs
                                        tabPanelColor='#41a4ff11'
                                        tabPanelClass='document_tab_panel'
                                        mainClassName='document_tabs'
                                        data={tabs}
                                        onCloseTab={(id, newIndex) => {
                                            if (newIndex === -1) {
                                                this.setState({
                                                    tabs: []
                                                });
                                                this.closeSideWindow();
                                            } else {
                                                this.setState({
                                                    tabs: this.state.tabs.filter(item => item.id !== id),
                                                    activeIndex: newIndex
                                                });
                                            }
                                        }}
                                        activeIndex={this.state.activeIndex}
                                    /> : <span/>}
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default LoadDocuments;