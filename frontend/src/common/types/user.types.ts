import type { RoleName } from '../ACL/ACLProvider';

/*------------- Master Types -------------*/

export interface IState {
  _id: string;
  name: string;
  code: string;
}

export interface IDistrict {
  _id: string;
  name: string;
  stateId: string | IState;
  code: string;
}

export interface ICity {
  _id: string;
  name: string;
  districtId: string | IDistrict;
  code: string;
}

/*------------- Common Address Type -------------*/

export interface IAddress {
  street?: string;
  city?: string | ICity;
  state?: string | IState;
  district?: string | IDistrict;
  pincode?: number;
}

/*------------- User & Role Types -------------*/

export interface IUserRole {
  name: RoleName;
  access: string[];
}

import type { ISchoolUser } from '@api/usersApi';

export type IUser = ISchoolUser;
