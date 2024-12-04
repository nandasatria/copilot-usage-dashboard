import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from './../../environments/environment';
import { map , switchMap} from 'rxjs/operators';
import { Observable, forkJoin, of  } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class OrganizationLevelService {

  private copilotUsageDataUrl = 'assets/copilot_usage_data.json'; // URL to JSON data
  private copilotSeatsDataUrl = 'assets/copilot_seats_data.json'; // URL to JSON data

  constructor(private http: HttpClient) { }

  getCopilotUsageData(): Observable<any>  {
    // sample dta loaded from local file
    // return this.http.get(this.copilotUsageDataUrl);
    // uncomment below line to invoke API
    // modify the environment file to add your token
    // modify the organization name to your organization
    return this.invokeCopilotUsageApi();
  }

  getCopilotSeatsData(): Observable<any>  {
    // sample dta loaded from local file
    // return this.http.get(this.copilotSeatsDataUrl);
    // uncomment below line to invoke API
    // modify the environment file to add your token
    // modify the organization name to your organization
    const result =  this.invokeCopilotSeatApi();
    console.log(" getCopilotSeatsData : ", result)
    return result;
  }

  invokeCopilotUsageApi(): Observable<any> {
    const orgName = environment.orgName; 
    const apiUrl = `${environment.ghBaseUrl}/${orgName}/${environment.copilotUsageApiUrl}`;
    const token = environment.token; 
    
    const headers = new HttpHeaders({
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    });

    return this.http.get(apiUrl, { headers });
  }


    invokeCopilotSeatApi(): Observable<any> {
      const orgName = environment.orgName;
      const apiUrl = `${environment.ghBaseUrl}/${orgName}/${environment.copilotSeatApiUrl}`;
      
      return this.getPaginatedSeatsData(apiUrl, 1).pipe(
        switchMap((firstPageData: any) => {
          let totalPages = firstPageData.totalPages || 1;
          let observables: Observable<any>[] = [of(firstPageData)];
          
          for (let pageNo = 2; pageNo <= totalPages; pageNo++) {
            observables.push(this.getPaginatedSeatsData(apiUrl, pageNo));
          }
          
          return forkJoin(observables);
        }),
        map((allResponses: any[]) => {
          let result = allResponses[0];
          for (let i = 1; i < allResponses.length; i++) {
            result.seats = result.seats.concat(allResponses[i].seats);
          }
          console.log("Combined response data: ", result);
          return result;
        })
      );
    }
  


  // invokeCopilotSeatApi(): Observable<any> {
  //   const orgName = environment.orgName; 
  //   const apiUrl = `${environment.ghBaseUrl}/${orgName}/${environment.copilotSeatApiUrl}`;
  //   var result:any;
  //   var firstPage=true;
  //   var pageNo=1;
  //   var totalPages=1;

  //   // get the paginated Copilot Seat allocation data
  //   do{
  //     var response = this.getPaginatedSeatsData(apiUrl, pageNo);
      
  //     response.subscribe((data: any) => {
        
  //       if(firstPage){
  //         result=data;
  //         firstPage=false;
  //         if ('totalPages' in data) {
  //           totalPages = data.totalPages;
  //         }
  //       }
  //       else{
  //         result.seats=result.seats.concat(data.seats);
  //       }
  //       console.log("response  data : ",result)
  //     });

  //     console.log(" data : ",result)

  //     pageNo=pageNo+1;
  //   }while(pageNo < totalPages);

  //   // console.log("data from invoke seat " ,data);
  //   return result;
  // }

  getPaginatedSeatsData(apiUrl:any, pageNo:any): Observable<any> {
    const token = environment.token; 
    
    const headers = new HttpHeaders({
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    });

    return this.http.get(apiUrl+"?page="+pageNo, { headers });

  }

}