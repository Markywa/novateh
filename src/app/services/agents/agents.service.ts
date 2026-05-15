import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AgentsService {
  constructor(private http: HttpClient) { }

  getAgentsList$(): Observable<any[]> {
    return this.http.get<any[]>('/v1/agents');
  }
}