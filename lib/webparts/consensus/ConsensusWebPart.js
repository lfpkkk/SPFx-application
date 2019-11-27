var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Version, Environment, EnvironmentType, UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, PropertyPaneTextField } from '@microsoft/sp-webpart-base';
import styles from './ConsensusWebPart.module.scss';
import * as strings from 'ConsensusWebPartStrings';
import MockConsensusHttpClient from './MockConsensusHttpClient';
import { ScoreType } from './consensus-entities';
import RequirementTemplate from './RequirementTemplate';
import * as jQuery from 'jquery';
import 'jqueryui';
import { SPComponentLoader } from '@microsoft/sp-loader';
import ConsensusService from './consensus-service';
var ConsensusWebPart = /** @class */ (function (_super) {
    __extends(ConsensusWebPart, _super);
    function ConsensusWebPart() {
        var _this = _super.call(this) || this;
        _this._vendorId = '';
        _this._vendors = [];
        _this._scores = [];
        //make key : value array
        _this._scoreWeightings = {};
        _this._requirements = [];
        _this._comments = [];
        SPComponentLoader.loadCss('//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css');
        return _this;
    }
    ConsensusWebPart.prototype._getQryStringValues = function () {
        var queryParms = new UrlQueryParameterCollection(window.location.href);
        if (queryParms.getValue('vId')) {
            this._vendorId = queryParms.getValue('vId');
        }
    };
    ConsensusWebPart.prototype.render = function () {
        this._getQryStringValues();
        this.domElement.innerHTML = "\n    <div class=\"" + styles.consensus + "\">\n      <div class=\"" + styles.container + "\">\n        <div id=\"consensusDiv\">\n        </div>\n      </div>\n    </div>";
        this._checkPermissions();
        ConsensusService._hideOnStartUp();
    };
    ConsensusWebPart.prototype._checkPermissions = function () {
        var _this = this;
        this.consensusService = (Environment.type === EnvironmentType.Local) ?
            new MockConsensusHttpClient() :
            new ConsensusService(this.context);
        this.consensusService.getUserGroups().then(function (groups) {
            _this._isFullAccess = (groups.indexOf("DOE Consensus Full") !== -1) ? true : false;
            _this._isReadOnly = (groups.indexOf("DOE Consensus ReadOnly") !== -1) ? true : false;
            if (_this._isFullAccess || _this._isReadOnly) {
                _this._renderListAsync();
            }
            else {
                jQuery('div[id="consensusDiv"').text("Sorry, You does not have right privilege access this page.");
            }
        });
    };
    ConsensusWebPart.prototype._renderListAsync = function () {
        var _this = this;
        this.consensusService.getLoggedInUserId()
            .then(function (user) {
            _this._LoggedInUserId = user;
        });
        this.consensusService.getVendors()
            .then(function (vendors) { return _this._onVendorsFetched(vendors.value); })
            .then(function () {
            _this.consensusService.getRequirements()
                .then(function (requirements) { return _this._onRequirementsFetched(requirements.value); })
                .then(function () {
                _this.consensusService.getScoreWeightings()
                    .then(function (weight) { return _this.onWeightsFetched(weight.value); })
                    .then(function () {
                    _this.consensusService.getComments()
                        .then(function (comments) { return _this._onCommentsFetched(comments.value); })
                        .then(function () {
                        _this.consensusService.getScores()
                            .then(function (response) {
                            _this._afterScoresFetched(response.value);
                            _this._renderRequirementList();
                        });
                    });
                });
            });
        });
    };
    ConsensusWebPart.prototype._onVendorsFetched = function (vendors) {
        this._vendors = vendors.map(function (v) { return v; });
    };
    ConsensusWebPart.prototype._afterScoresFetched = function (scores) {
        var _this = this;
        scores.forEach(function (s) {
            var score = s;
            if (score.ScoreType == ScoreType.Consensus) {
                score.WeightedScore = s.Score / 9 * _this._scoreWeightings[s.RequirementNumber];
            }
            _this._scores.push(score);
        });
    };
    ConsensusWebPart.prototype.onWeightsFetched = function (weights) {
        var _this = this;
        //go through requirement and add weight if exists otherwise 1
        this._requirements.forEach(function (r) {
            var filtereedWeight = weights.filter(function (w) { return w.RequirementNumber === r.RequirementNumber; });
            var weight = (filtereedWeight.length > 0) ? filtereedWeight[0].ScoreWeight : 1;
            _this._scoreWeightings[r.RequirementNumber] = weight;
        });
    };
    ConsensusWebPart.prototype._onRequirementsFetched = function (requirements) {
        this._requirements = requirements.map(function (r) { return r; });
    };
    ConsensusWebPart.prototype._onCommentsFetched = function (comments) {
        this._comments = comments.map(function (r) { return r; });
    };
    ConsensusWebPart.prototype._renderRequirementList = function () {
        var html = RequirementTemplate.getRequirementHtml(this._vendors, this._requirements, this._scores, this._comments, this.context.pageContext.web.absoluteUrl);
        var consensusDivElement = this.domElement.querySelector('#consensusDiv');
        consensusDivElement.innerHTML = html;
        var accordionOptions = {
            animate: true,
            collapsible: true,
            active: false,
            heightStyle: "content"
        };
        jQuery('[divName="consensusAccordion"]').accordion(accordionOptions);
        this._onReadOnly();
        this._addEventHandler();
    };
    ConsensusWebPart.prototype._onReadOnly = function () {
        if (this._isReadOnly && !this._isFullAccess) { //user who has both full access and readonly can still edit
            jQuery('input').prop("readOnly", true);
            jQuery('textarea').prop("readOnly", true);
            jQuery('button[name="btn_SaveConsensusScore"]').prop("disabled", true); // use jQuery().button("disabled") incurs err msg
        }
    };
    ConsensusWebPart.prototype._addEventHandler = function () {
        var _this = this;
        jQuery('div[divName="consensusScoreContainer"]')
            .on('click', 'button[name="btn_SaveConsensusScore"]', function (event, ui) {
            var ConsensusScoreSectionId = event.target.getAttribute('id');
            var ConsensusScoreContainer = jQuery('div[id="consensusScores' + ConsensusScoreSectionId + '"]');
            var vendorId = ConsensusScoreContainer.find('input[name="vendorId"][type="hidden"]').val();
            var reqNumber = ConsensusScoreContainer.find('input[name="reqNum"][type="hidden"]').val();
            var consensusScore = ConsensusScoreContainer.find('input[name="score"][type="text"]').val();
            var consensusComments = ConsensusScoreContainer.find('textarea[name="comment"]').val();
            if (!consensusScore) {
                alert('Please enter a valid Consensus score.');
                return;
            }
            var scoreNumber = Number(consensusScore);
            if (isNaN(scoreNumber)) {
                alert('Please enter score between 0-9, number only');
                return;
            }
            if (!(scoreNumber >= 0 && scoreNumber <= 9)) {
                alert('Please enter score between 0-9');
                return;
            }
            if (consensusComments.trim().length === 0) {
                alert('Please enter comment');
                return;
            }
            _this.consensusService.saveConsensusScoreDetails(reqNumber, vendorId, consensusScore, consensusComments, _this._LoggedInUserId);
            //update question consensue score on screen
            var weightedScore = scoreNumber / 9 * _this._scoreWeightings[reqNumber];
            jQuery("h2[vendorid=\"" + vendorId + "\"]")
                .next()
                .find("span[name=\"" + reqNumber + "\"]")
                .html("Consensus score: <b>" + scoreNumber + "</b> (" + weightedScore.toFixed(2) + "%)"); // only match span for current vendor
            //update vendor consensus score on screen
            var scoreBox = jQuery("h2[vendorid=\"" + vendorId + "\"]").next().find("div[id^=\"consensusScores\"]");
            var scoreCount = 0;
            var totalScore = 0;
            var totalWeightScore = 0;
            scoreBox.each(function (i, ele) {
                reqNumber = jQuery(ele).find('input[name="reqNum"][type="hidden"]').val();
                consensusScore = jQuery(ele).find('input[name="score"][type="text"]').val();
                if (consensusScore != "" && !isNaN(Number(consensusScore))) {
                    totalScore += Number(consensusScore);
                    totalWeightScore += (Number(consensusScore) / 9 * _this._scoreWeightings[reqNumber]);
                    scoreCount++;
                }
            });
            var vendorScorehtml = "In Progress";
            if (scoreBox.length == scoreCount && scoreCount > 0) {
                vendorScorehtml = "Consensus score: <b>" + totalScore + "</b> (" + totalWeightScore.toFixed(2) + "%)";
            }
            jQuery("h2[vendorid=\"" + vendorId + "\"]")
                .find("span[name=\"vendorConsensusScore\"]")
                .html(vendorScorehtml);
        });
        this._showConsensusEventHandler();
    };
    ConsensusWebPart.prototype._showConsensusEventHandler = function () {
        var _this = this;
        this.domElement.querySelector('#consensusDiv').addEventListener('click', function (event) {
            if (event.srcElement.id !== 'evalDiv') {
                var _srcElement = event.srcElement;
                if (_srcElement.innerHTML === 'Print View') {
                    _this._assignPrintView();
                }
            }
        });
    };
    ConsensusWebPart.prototype._assignPrintView = function () {
        var element = jQuery("div[id=\"requirementDetailsDiv\"]");
        // copy html
        var printHTML = "<div style=\"float:right;\"><button id=\"printPageBtn\" onClick=\"window.print();\">Print</button></div>"; // print button
        printHTML += "\n    <div style=\"clear:both\">\n      <h1>Consensus Report as at " + this._date + "</h1>\n      " + element.html() + "\n    </div>";
        // after copy html
        // element.find(`div[divName=consensusAccordion]`).hide();
        // element.find(`div[divname="consensusScoreContainer"]`).hide();
        if (this._isFullAccess) {
            element.find('input').prop("readOnly", false);
            element.find('textarea').prop("readOnly", false);
            element.find("button[name=\"btn_SaveConsensusScore\"]").prop("disabled", false);
        }
        // popup window
        var windowName = 'ConsensusWebPartPrintViewWindow'; // assign window a unique name
        // popup in centre of screen, not work for dualscreen
        var height = 670, width = element.width();
        var left = (screen.width - width) / 2;
        var top = (screen.height - height) / 4;
        var win = window.open('', windowName, "location=no,height='" + height + "',width='" + width + "',left='" + left + "',top='" + top + "',scrollbars=yes,status=yes"); //set a unique window name
        // get css stylings
        var cssText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
            try {
                var css = document.styleSheets[i].cssRules;
                if (css[0].cssText.indexOf("consensus") > 0) {
                    for (var j = 0; j < document.styleSheets.length; j++) {
                        cssText += css[j].cssText.replace("." + styles.consensus + " ", "");
                    }
                    break;
                }
            }
            catch (_a) { }
        }
        // hide print button when print
        win.document.head.innerHTML = "<style> \n      @media print {\n        body {\n          -webkit-print-color-adjust: exact; // Chrome\n          color-adjust: exact; // Firefox\n        }\n        #printPageBtn {\n          display: none;\n          width: 80px;\n        }\n      }\n      " + cssText + "\n    </style>";
        win.document.body.innerHTML = printHTML;
        this._getPrintViewFormatted($(win.document.body));
    };
    Object.defineProperty(ConsensusWebPart.prototype, "_date", {
        get: function () {
            var today = new Date();
            return today.toLocaleDateString('en-GB');
        },
        enumerable: true,
        configurable: true
    });
    ConsensusWebPart.prototype._getPrintViewFormatted = function (body) {
        var style = {
            backgroundColor: '#eaeded !important',
            padding: '10px'
        };
        body.find("h2").css(style);
        body.find("div[divName=consensusAccordion]").show();
        body.find("div[divname=\"consensusScoreContainer\"]").show();
        body.find('input').prop('readOnly', true);
        body.find("button[name=\"btn_SaveConsensusScore\"]").hide();
        body.find('textarea').each(function (index, element) {
            var html = "<div style=\"word-wrap: break-word; white-space:pre-wrap;\">" + element.innerHTML + "</div>";
            jQuery(this).after(html);
            jQuery(this).remove();
        });
        body.find("div[id^=\"consensusScores\"]").each(function () {
            var score = jQuery(this).find("div:contains(\"Score :\")");
            score.css('font-weight', 'bold');
            score.append(" " + score.next().find("input[name=\"score\"]").val());
            score.next().remove();
            var comment = jQuery(this).find("div:contains(\"Comments :\")");
            comment.css('font-weight', 'bold');
        });
    };
    Object.defineProperty(ConsensusWebPart.prototype, "dataVersion", {
        get: function () {
            return Version.parse('1.0');
        },
        enumerable: true,
        configurable: true
    });
    ConsensusWebPart.prototype.getPropertyPaneConfiguration = function () {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                PropertyPaneTextField('description', {
                                    label: strings.DescriptionFieldLabel
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    };
    return ConsensusWebPart;
}(BaseClientSideWebPart));
export default ConsensusWebPart;
//# sourceMappingURL=ConsensusWebPart.js.map