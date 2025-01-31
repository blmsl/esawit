﻿import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { HarvestBunchesPage } from '../HarvestBunches/HarvestBunches';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import * as constants from '../../../config/constants';
import { Http } from '@angular/http';

@Component({
    selector: 'page-home',
    templateUrl: 'MandorHome.html'
})
export class MandorHomePage {
    ifConnect: Subscription;
    UserGUID: string;
    totalHarvested: number; totalLoaded: number; balanceHarvested: number;
    constructor(private network: Network, public global: SharedFunctions, public http: Http, private sqlite: SQLite, private myCloud: StorageService, private mainMenu: SharedFunctions, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
        // this.translateToEnglish();
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        this.getSummary();
    }

    //-----------------------Offline Sync---------------------------
    syncAndRefresh() {
        this.myCloud.syncMandorInfoCloudToSQLite(this.UserGUID, this.global.getStringDate());
        this.myCloud.saveHarvestToCloudFromSQLite();
        this.myCloud.syncHarvestHistoryCloudToSQLite();
        this.myCloud.saveLoadToCloudFromSQLite();
        this.myCloud.syncLoadHistoryCloudToSQLite();
        this.myCloud.getVehicleDriverListFromCloud();
    }

    ionViewWillEnter() {
        if (this.network.type != "none") {
            this.syncAndRefresh();
        }
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.syncAndRefresh();
        }, error => console.log('Error In SurveyorHistory :' + error));

    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------
    getSummaryOld() {
        // if (this.network.type == "none") {
        //     this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
        //         this.totalHarvested = 0;
        //         this.totalLoaded = 0;
        //         var query = "select * from mandor_harvested_info";
        //         db.executeSql(query, {}).then((data) => {
        //             this.totalHarvested = data.rows.item(0).total_harvested;
        //             this.balanceHarvested = this.totalHarvested - this.totalLoaded
        //             query = "select * from mandor_loaded_info";
        //             db.executeSql(query, {}).then((data) => {
        //                 this.totalLoaded = data.rows.item(0).total_loaded;
        //                 this.balanceHarvested = this.totalHarvested - this.totalLoaded
        //             }, (err) => {
        //                 console.log('getMandorInfoFromSQLite: ' + JSON.stringify(err));
        //             });
        //         }, (err) => {
        //             console.log('getMandorInfoFromSQLite: ' + JSON.stringify(err));
        //         });
        //         this.balanceHarvested = this.totalHarvested - this.totalLoaded
        //     }).catch(e => console.log("getMandorInfoFromSQLite: " + JSON.stringify(e)));
        // }
        // else {
        //     this.totalHarvested = 0;
        //     this.totalLoaded = 0;
        //     var url = constants.DREAMFACTORY_TABLE_URL + "/harvested_count_loc_date_view?filter=(user_GUID=" + this.UserGUID + ")AND(harvested_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
        //     this.http.get(url).map(res => res.json()).subscribe(data => {
        //         var cloudData = data["resource"];
        //         if (cloudData.length == 0) {
        //             this.totalHarvested = 0
        //         }
        //         else {
        //             cloudData.forEach(element => {
        //                 this.totalHarvested += element.total_bunches
        //             });
        //             this.balanceHarvested = this.totalHarvested - this.totalLoaded
        //         }
        //     });
        //     url = constants.DREAMFACTORY_TABLE_URL + "/loaded_count_loc_date_view?filter=(user_GUID=" + this.UserGUID + ")AND(loaded_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
        //     this.http.get(url).map(res => res.json()).subscribe(data => {
        //         var cloudData = data["resource"];
        //         if (cloudData.length == 0) {
        //             this.totalLoaded = 0
        //         }
        //         else {
        //             cloudData.forEach(element => {
        //                 this.totalLoaded += element.total_bunches
        //             });
        //             this.balanceHarvested = this.totalHarvested - this.totalLoaded
        //         }
        //     });
        //     this.balanceHarvested = this.totalHarvested - this.totalLoaded
        // }
    }

    getSummary() {
        this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
            this.totalHarvested = 0;
            this.totalLoaded = 0;
            var query = "select SUM(bunch_count) AS total_harvested from harvested_info where date_stamp=strftime('%Y-%m-%d','now')";
            db.executeSql(query, {}).then((data) => {
                console.log(data)
                this.totalHarvested = data.rows.item(0).total_harvested || 0;
                this.balanceHarvested = this.totalHarvested - this.totalLoaded
                query = "select SUM(bunch_count) AS total_loaded  from loaded_info where date_stamp=strftime('%Y-%m-%d','now')";
                db.executeSql(query, {}).then((data) => {
                    this.totalLoaded = data.rows.item(0).total_loaded || 0;
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                }, (err) => {
                    console.log('getMandorInfoFromSQLite: ' + JSON.stringify(err));
                });
            }, (err) => {
                console.log('getMandorInfoFromSQLite: ' + JSON.stringify(err));
            });
            this.balanceHarvested = this.totalHarvested - this.totalLoaded
        }).catch(e => console.log("getMandorInfoFromSQLite: " + JSON.stringify(e)));

    }



    onLink(url: string) {
        window.open(url);
    }
    openGlobalMenu() {
        this.mainMenu.openMenu();
    }

    public NewHarvest() {
        this.navCtrl.setRoot(HarvestBunchesPage, {});
    }
 

    //---------------------Language module start---------------------//
    // public translateToEnglishClicked: boolean = false;
    // public translateToMalayClicked: boolean = true;

    // public translateToEnglish() {
    //     this.translateService.use('en');
    //     this.translateToMalayClicked = !this.translateToMalayClicked;
    //     this.translateToEnglishClicked = !this.translateToEnglishClicked;
    // }

    // public translateToMalay() {
    //     this.translateService.use('ms');
    //     this.translateToEnglishClicked = !this.translateToEnglishClicked;
    //     this.translateToMalayClicked = !this.translateToMalayClicked;
    // }
    //---------------------Language module end---------------------//
}
