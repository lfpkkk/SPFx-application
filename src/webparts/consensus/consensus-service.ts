import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { ISPVendorsList, ISPRequirementList, ISPScoresList, ScoreType, ISPScoreWeightingsList } from './consensus-entities';
import { Web } from '@pnp/sp';
import { CurrentUser } from '@pnp/sp/src/siteusers';
import styles from './ConsensusWebPart.module.scss';
import { SiteGroup } from '@pnp/sp/src/sitegroups';



export default class ConsensusService {

  private web: Web;

  public constructor(private context) {

    this.web = new Web(this.context.pageContext.web.absoluteUrl);
  }

  public getUserGroups() : Promise<string[]>{
    return this.web.currentUser.groups.get().then(r => {      
      let groups : string[] = [];
      if(r) {
        r.forEach((sg: SiteGroup)=> {
          if (sg["Title"]) {
            groups.push(sg["Title"]);
          }
        });        
      }   
      return groups;   
    });
  }

  public getLoggedInUserId() {
    return this.web.currentUser
      .get()
      .then((user: CurrentUser) => {
        return user['Id'];
      });
  }

  public getVendors(): Promise<ISPVendorsList> {
    return this.context.spHttpClient
      .get(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetByTitle('Vendors')/Items?$select=Alias,ID`,
        SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  public getRequirements(): Promise<ISPRequirementList> {

    return this.context.spHttpClient
      .get(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Requirements')/Items?$select=ID,Title,RequirementNumber,Parent
        &$filter=(IsBundle ne 1) and (BundleName eq null)
        &$orderby=RequirementNumber asc
        &$top=1000`,
        SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  public getScores(): Promise<ISPScoresList> {
    //get scores that submitted is true
    return this.context.spHttpClient
      .get(
        this.context.pageContext.web.absoluteUrl +
        `/_api/web/lists/GetByTitle('Scores')/Items?$select=ID,VendorID,RequirementNumber,Score,ScoreType,CommentText,EnteredBy/Title
        &$filter=(Submitted eq 1) or (ScoreType eq 'Consensus')
        &$expand=EnteredBy
        &$orderby=RequirementNumber asc
        &$top=1000`,
        SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  public getComments() : Promise<ISPScoresList> {
    //get scores that submitted is true
    return this.context.spHttpClient
      .get(
        this.context.pageContext.web.absoluteUrl +
        `/_api/web/lists/GetByTitle('Scores')/Items?$select=ID,VendorID,RequirementNumber,Score,ScoreType,CommentText,EnteredBy/Title
        &$filter=(Submitted eq 0) and ((ScoreType eq 'EP') and (Score ne null))
        &$expand=EnteredBy
        &$orderby=RequirementNumber asc
        &$top=1000`,
        SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }
  public getScoreWeightings(): Promise<ISPScoreWeightingsList> {
    //get scores that submitted is true
    return this.context.spHttpClient
      .get(
        this.context.pageContext.web.absoluteUrl +
        `/_api/web/lists/GetByTitle('ScoreWeightings')/Items?$select=ID,RequirementNumber,ScoreWeight`,
        SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _showSuccessMsg(scoreSectionId) {
    var className = `${styles.scoreSavedMsg}`;
    jQuery('div[Id="consensusScores' + scoreSectionId + '"] span.' + className).show().delay(5000).fadeOut();
  }

  public saveConsensusScoreDetails(reqNumber, vendorId, consensusScore, consensusComment, enteredBy) {

    this.context.spHttpClient
      .get(this.context.pageContext.web.absoluteUrl +
        `/_api/web/Lists/GetByTitle('Scores')/Items?$select=ID
        &$filter=(((RequirementNumber eq '${reqNumber}') 
                  and (VendorID eq ${vendorId})) and (ScoreType eq 'Consensus'))`,

        SPHttpClient.configurations.v1
      )
      .then(getresponse => { 
        return getresponse.json(); 
      })
      .then(result => {

        if (result.value.length > 0) {

          let _id = result.value[0]['Id'];

          let updateurl: string = this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('Scores')/Items(${_id})`;

          this.context.spHttpClient
            .post(updateurl,
              SPHttpClient.configurations.v1,
              {
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

          this.web.lists.getByTitle('Scores').items.add({
            Title: vendorId + '-' + reqNumber,
            EnteredById: enteredBy,
            RequirementNumber: reqNumber,
            VendorID: vendorId,
            Score: consensusScore,
            CommentText: consensusComment,
            ScoreType: ScoreType.Consensus
          }).then(r => {            
            console.log('AddResult: ' + r);
          });

        }
      })
      .then(() => {
        let scoreSectionId = `${vendorId}-${reqNumber}`;
        this._showSuccessMsg(scoreSectionId);
      })
      .catch(error => console.log('error: ', error));
  }

  public static _hideOnStartUp() {  
    window.addEventListener('load', () => { 
      jQuery('div[class="commandBarWrapper"]').hide();
      jQuery('div[class^="pageTitle"]').hide();
    });      
  }
}

