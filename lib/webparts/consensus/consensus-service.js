import { SPHttpClient } from '@microsoft/sp-http';
import { ScoreType } from './consensus-entities';
import { Web } from '@pnp/sp';
import styles from './ConsensusWebPart.module.scss';
var ConsensusService = /** @class */ (function () {
    function ConsensusService(context) {
        this.context = context;
        this.web = new Web(this.context.pageContext.web.absoluteUrl);
    }
    ConsensusService.prototype.getUserGroups = function () {
        return this.web.currentUser.groups.get().then(function (r) {
            var groups = [];
            if (r) {
                r.forEach(function (sg) {
                    if (sg["Title"]) {
                        groups.push(sg["Title"]);
                    }
                });
            }
            return groups;
        });
    };
    ConsensusService.prototype.getLoggedInUserId = function () {
        return this.web.currentUser
            .get()
            .then(function (user) {
            return user['Id'];
        });
    };
    ConsensusService.prototype.getVendors = function () {
        return this.context.spHttpClient
            .get(this.context.pageContext.web.absoluteUrl + "/_api/web/lists/GetByTitle('Vendors')/Items?$select=Alias,ID", SPHttpClient.configurations.v1)
            .then(function (response) {
            return response.json();
        });
    };
    ConsensusService.prototype.getRequirements = function () {
        return this.context.spHttpClient
            .get(this.context.pageContext.web.absoluteUrl + "/_api/web/lists/GetByTitle('Requirements')/Items?$select=ID,Title,RequirementNumber,Parent\n        &$filter=(IsBundle ne 1) and (BundleName eq null)\n        &$orderby=RequirementNumber asc\n        &$top=1000", SPHttpClient.configurations.v1)
            .then(function (response) {
            return response.json();
        });
    };
    ConsensusService.prototype.getScores = function () {
        //get scores that submitted is true
        return this.context.spHttpClient
            .get(this.context.pageContext.web.absoluteUrl +
            "/_api/web/lists/GetByTitle('Scores')/Items?$select=ID,VendorID,RequirementNumber,Score,ScoreType,CommentText,EnteredBy/Title\n        &$filter=(Submitted eq 1) or (ScoreType eq 'Consensus')\n        &$expand=EnteredBy\n        &$orderby=RequirementNumber asc\n        &$top=1000", SPHttpClient.configurations.v1)
            .then(function (response) {
            return response.json();
        });
    };
    ConsensusService.prototype.getComments = function () {
        //get scores that submitted is true
        return this.context.spHttpClient
            .get(this.context.pageContext.web.absoluteUrl +
            "/_api/web/lists/GetByTitle('Scores')/Items?$select=ID,VendorID,RequirementNumber,Score,ScoreType,CommentText,EnteredBy/Title\n        &$filter=(Submitted eq 0) and ((ScoreType eq 'EP') and (Score ne null))\n        &$expand=EnteredBy\n        &$orderby=RequirementNumber asc\n        &$top=1000", SPHttpClient.configurations.v1)
            .then(function (response) {
            return response.json();
        });
    };
    ConsensusService.prototype.getScoreWeightings = function () {
        //get scores that submitted is true
        return this.context.spHttpClient
            .get(this.context.pageContext.web.absoluteUrl +
            "/_api/web/lists/GetByTitle('ScoreWeightings')/Items?$select=ID,RequirementNumber,ScoreWeight", SPHttpClient.configurations.v1)
            .then(function (response) {
            return response.json();
        });
    };
    ConsensusService.prototype._showSuccessMsg = function (scoreSectionId) {
        var className = "" + styles.scoreSavedMsg;
        jQuery('div[Id="consensusScores' + scoreSectionId + '"] span.' + className).show().delay(5000).fadeOut();
    };
    ConsensusService.prototype.saveConsensusScoreDetails = function (reqNumber, vendorId, consensusScore, consensusComment, enteredBy) {
        var _this = this;
        this.context.spHttpClient
            .get(this.context.pageContext.web.absoluteUrl +
            ("/_api/web/Lists/GetByTitle('Scores')/Items?$select=ID\n        &$filter=(((RequirementNumber eq '" + reqNumber + "') \n                  and (VendorID eq " + vendorId + ")) and (ScoreType eq 'Consensus'))"), SPHttpClient.configurations.v1)
            .then(function (getresponse) {
            return getresponse.json();
        })
            .then(function (result) {
            if (result.value.length > 0) {
                var _id = result.value[0]['Id'];
                var updateurl = _this.context.pageContext.web.absoluteUrl + ("/_api/web/Lists/GetByTitle('Scores')/Items(" + _id + ")");
                _this.context.spHttpClient
                    .post(updateurl, SPHttpClient.configurations.v1, {
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "OData-Version": "",
                        "IF-MATCH": '*',
                        "X-HTTP-Method": 'MERGE'
                    },
                    body: JSON.stringify({
                        __metadata: { type: 'SP.Data.ScoresListItem' },
                        Score: consensusScore,
                        CommentText: consensusComment,
                        EnteredById: enteredBy
                    })
                });
            }
            else {
                _this.web.lists.getByTitle('Scores').items.add({
                    Title: vendorId + '-' + reqNumber,
                    EnteredById: enteredBy,
                    RequirementNumber: reqNumber,
                    VendorID: vendorId,
                    Score: consensusScore,
                    CommentText: consensusComment,
                    ScoreType: ScoreType.Consensus
                }).then(function (r) {
                    console.log('AddResult: ' + r);
                });
            }
        })
            .then(function () {
            var scoreSectionId = vendorId + "-" + reqNumber;
            _this._showSuccessMsg(scoreSectionId);
        })
            .catch(function (error) { return console.log('error: ', error); });
    };
    ConsensusService._hideOnStartUp = function () {
        window.addEventListener('load', function () {
            jQuery('div[class="commandBarWrapper"]').hide();
            jQuery('div[class^="pageTitle"]').hide();
        });
    };
    return ConsensusService;
}());
export default ConsensusService;
//# sourceMappingURL=consensus-service.js.map