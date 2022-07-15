import React from 'react';
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

class LoadDocuments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autoSuggestionString: '',
            showProfile: false,
            userProfile: {},
            microsites: [],
            userSegments: [],
            userAccessLevels: [],
            currentMicrosite: '',
            buckets: [],
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
            resultsWidth: 'col-lg-8',
            documentWidth: 'd-none',
            currentDocument: null,
            selectedDocumentID: -1,
            sortField: '',
            value: '',
            sortOrder: 1,
            languageSelectionType: 'All',
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
        this.logout = this.logout.bind(this);
    }

    chooseMicrosite(event) {
        event.preventDefault();
        this.setState({
            currentMicrosite: event.currentTarget.getAttribute("data-microsite-id")
        })
        console.log('Microsite changed to ' + event.currentTarget.getAttribute("data-microsite-id"));
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
        console.log("Key = " + event.key);
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
                        text = text.replaceAll("viewdoc_tab.gif", "viewdoc_tab.png")
                        this.setState({
                            selectedDocumentID: docID,
                            currentDocument: text,
                            resultsWidth: 'col-lg-4',
                            documentWidth: 'col-lg-4'
                        })
                    });
                }
            }, (error) => {
                this.setState({
                    currentDocument: "", resultsWidth: 'col-lg-8', documentWidth: 'd-none', error
                });
            })
    }

    closeSideWindow(event) {
        event.preventDefault();
        this.setState({
            selectedDocumentID: -1, currentDocument: "", resultsWidth: 'col-lg-8', documentWidth: 'hidden-lg'
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
                        this.setState({
                            selectedDocumentID: docId,
                            currentDocument: formattedJSON,
                            resultsWidth: 'col-lg-4',
                            documentWidth: 'col-lg-4'
                        })
                    });
                }
            }, (error) => {
                this.setState({
                    currentDocument: "", resultsWidth: 'col-lg-8', documentWidth: 'hidden-lg', error
                });
            })
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
        this.setState({
            userProfile: cookies.get('user'),
            microsites: cookies.get('user')['microsites'],
            userSegments: cookies.get('user')['segments'],
            userAccessLevels: cookies.get('user')['accessLevels'],
            currentMicrosite: cookies.get('user')['microsites'][0].id
        }, () => {

            this.loadEntitlements();
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
                        let nodesTemp = result.map(concept => {
                            return {
                                value: concept.id, label: concept.names['LA_eng_US'].replace(/(.{15})..+/, "$1..")
                            };
                        });
                        nodesTemp.sort(this.sortNames);
                        this.setState({
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
                        console.log("Segment Summary Map " + JSON.stringify(segmentSummaryMap));
                        for (let j = 0; j < result.length; j++) {
                            let enterpriseSegmentKey = result[j].value;
                            let enterpriseSegmentPrefix = enterpriseSegmentKey.substring(0, enterpriseSegmentKey.indexOf("_"));
                            if (segmentSummaryMap[enterpriseSegmentPrefix] !== undefined) {
                                result[j].children = result[j].children.filter(e => segmentSummaryMap[enterpriseSegmentPrefix].includes(e.value));
                            }
                        }
                        this.setState({
                            checkedEnterpriseSegments: selectedSegmentsNodes,
                            enterpriseSegmentsNodes: result
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
                        let nodesTemp = Object.keys(productsMapTemp);
                        this.setState({
                            productsMap: productsMapTemp, productNodes: nodesTemp
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
                        console.log(concept);
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
                            let validBuckets = result.buckets.filter(e => result.totalHits != 10000 && e.count >= 0.2 * result.totalHits && e.count <= 0.6 * result.totalHits).slice(0, 20);
                            if (validBuckets.length === 0) {
                                validBuckets = result.buckets.filter(e => result.totalHits != 10000 && e.count >= 0.1 * result.totalHits && e.count <= 0.8 * result.totalHits).slice(0, 20);
                            }
                            this.setState({
                                listLoaded: true,
                                totalHits: result.totalHits,
                                buckets: validBuckets,
                                listItems: this.state.listItems.concat(result.hits),
                                loadedDocumentsCount: this.state.loadedDocumentsCount + result.hits.length
                            });
                            if (this.state.debug) {
                                let formattedJSON = '<pre style="font-size: 11px">' + JSON.stringify({"query": result.query}, null, 2) + '</pre>';
                                this.setState({
                                    selectedDocumentID: -1,
                                    currentDocument: formattedJSON,
                                    resultsWidth: 'col-lg-4',
                                    documentWidth: 'col-lg-4'
                                })
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
        <span>{suggestion.label}</span>
    );

    renderInputComponent = inputProps => (
        <div>
            <input type="text" {...inputProps}
                   className="form-control"
                   autoComplete="off"
                   id="search"/>
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
            resultsWidth,
            documentWidth,
            currentDocument,
            selectedDocumentID,
            suggestions,
            value,
            microsites,
            currentMicrosite
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

        const searchHitsStyle = {
            color: '#41a4ff', fontSize: '14px', fontWeight: 'bold', lineHeight: '120%', margin: '5px',
            fontFamily: 'Roboto'
        };
        const submitBtnStyle = {
            backgroundColor: '#41a4ff', color: 'white', borderColor: '#41a4ff'
        };
        const searchControlsStyle = {
            textAlign: 'left',
            margin: '0px',
            padding: '0px',
            verticalAlign: 'top',
            fontSize: '14px',
            height: '100%',
            width: '20%'
        };
        const iconsStyle = {
            padding: '0px 5px', cursor: 'pointer'
        }
        const bucketKeyStyle = {
            padding: '5px', cursor: 'pointer',
            fontSize: '14px', fontFamily: 'Roboto'
        }
        const selectedDocumentStyle = {
            textAlign: 'left', verticalAlign: 'top', padding: '6px',
            margin: '0px 5px 12px 0px',
            backgroundColor: '#41a4ff11',
            borderRadius: '5px'
        };
        const documentStyle = {
            textAlign: 'left',
            verticalAlign: 'top',
            padding: '6px',
            margin: '0px 5px 12px 0px',
        };

        const selectedDocumentHrStyle = {
            color: 'white'
        };
        const documentHrStyle = {};

        const searchResultsStyle = {
            textAlign: 'left', margin: '0px', padding: '0px', verticalAlign: 'top', width: '40%'
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
            overflow: 'hidden', fontSize: '14px', textOverflow: 'ellipsis'
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
            <table style={{width: '100%', height: '100px', backgroundColor: '#41a4ff33'}}>
                <tbody>
                <tr>
                    <td style={{width: '20%', padding: '20px'}}><img src="img/kiku_logo.png" style={{height: '40px'}}
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
                                                className="mt-2 btn m-2"
                                                style={submitBtnStyle}>Search</Button>
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
                    <td style={searchControlsStyle}><Accordion allowZeroExpanded={true} allowMultipleExpanded={true}
                                                               preExpanded={['suggestions']}>
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
                                <Dropdown value={"All languages"}
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
                    <td style={searchResultsStyle}>
                        <div className="search_results">
                            <table style={{width: '100%'}}>
                                <tbody>
                                <tr>
                                    <td style={{width: '50%'}}><pre
                                        style={searchHitsStyle}
                                        className="">{totalHits != null ? (searchDisplayQuery + (totalHits === 10000 ? (totalHits + "+") : totalHits) + " results") : ""}</pre>
                                    </td>
                                    <td style={{width: '50%', textAlign: 'right', padding: '5px', visibility : (totalHits != null && totalHits > 0) ? 'visible' : 'hidden'}}
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
                                    <div className="container p-0">
                                        <div className="row">
                                            <div className="col-lg-11">
                                                <a onClick={this.openDocument} data-external-url={item.EXTERNALURL}
                                                   data-doc-id={item.ID}>
                                                    <div style={headingStyle}>
                                <span style={idStyle}
                                      dangerouslySetInnerHTML={{__html: item.KCTITLE}}/> <span
                                                        style={idStyle}>({item.KCEXTERNALID})</span>
                                                    </div>
                                                </a></div>
                                            <div className="col-lg-1" style={iconsStyle}><a onClick={this.openJSON}
                                                                                            data-doc-id={item.ID}><img
                                                src="img/knowledge.png" height="20px"/>
                                            </a></div>
                                        </div>
                                    </div>

                                    <div
                                        style={descriptionStyle}> <span
                                        dangerouslySetInnerHTML={{__html: item.CONTENT}}/></div>

                                </div>)) : <pre> {listLoaded ? "No records found" : "Please wait.. "}</pre>}
                            {totalHits > loadedDocumentsCount ?
                                <a onClick={this.loadMore} className="btn btn-secondary">Load More</a> : null}</div>
                    </td>
                    <td style={documentViewStyle}>
                        <div className="search_results">
                            <div dangerouslySetInnerHTML={{__html: currentDocument}}/>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>);
    }
}

export default LoadDocuments;