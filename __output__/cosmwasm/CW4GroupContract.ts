/**
* This file was automatically generated by cosmwasm-typescript-gen@latest.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the cosmwasm-typescript-gen generate command to regenerate this file.
*/

import { CosmWasmClient, ExecuteResult, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
export interface InstantiateMsg {
  admin?: string | null;
  members: Member[];
}
export interface Member {
  addr: string;
  weight: number;
}
export type ExecuteMsg = {
  update_admin: {
    admin?: string | null;
  };
} | {
  update_members: {
    add: Member[];
    remove: string[];
  };
} | {
  add_hook: {
    addr: string;
  };
} | {
  remove_hook: {
    addr: string;
  };
};
export type QueryMsg = {
  admin: {};
} | {
  total_weight: {};
} | {
  list_members: {
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  member: {
    addr: string;
    at_height?: number | null;
  };
} | {
  hooks: {};
};
export type QueryResponse = {
  admin: AdminResponse;
} | {
  total_weight: TotalWeightResponse;
} | {
  list_members: MemberListResponse;
} | {
  member: MemberResponse;
} | {
  hooks: HooksResponse;
};
export interface AdminResponse {
  admin?: string | null;
}
export interface TotalWeightResponse {
  weight: number;
}
export interface MemberListResponse {
  members: Member[];
}
export interface MemberResponse {
  weight?: number | null;
}
export interface HooksResponse {
  hooks: string[];
}
export interface CW4GroupReadOnlyInterface {
  contractAddress: string;
  admin: () => Promise<AdminResponse>;
  totalWeight: () => Promise<TotalWeightResponse>;
  listMembers: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<ListMembersResponse>;
  member: ({
    addr,
    atHeight
  }: {
    addr: string;
    atHeight?: number;
  }) => Promise<MemberResponse>;
  hooks: () => Promise<HooksResponse>;
}
export class CW4GroupQueryClient implements CW4GroupReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.admin = this.admin.bind(this);
    this.totalWeight = this.totalWeight.bind(this);
    this.listMembers = this.listMembers.bind(this);
    this.member = this.member.bind(this);
    this.hooks = this.hooks.bind(this);
  }

  admin = async (): Promise<AdminResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      admin: {}
    });
  };
  totalWeight = async (): Promise<TotalWeightResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_weight: {}
    });
  };
  listMembers = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<ListMembersResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      list_members: {
        limit,
        start_after: startAfter
      }
    });
  };
  member = async ({
    addr,
    atHeight
  }: {
    addr: string;
    atHeight?: number;
  }): Promise<MemberResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      member: {
        addr,
        at_height: atHeight
      }
    });
  };
  hooks = async (): Promise<HooksResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      hooks: {}
    });
  };
}
export interface CW4GroupInterface extends CW4GroupReadOnlyInterface {
  contractAddress: string;
  sender: string;
  updateAdmin: ({
    admin
  }: {
    admin?: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  updateMembers: ({
    add,
    remove
  }: {
    add: Member[];
    remove: string[];
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  addHook: ({
    addr
  }: {
    addr: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  removeHook: ({
    addr
  }: {
    addr: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
}
export class CW4GroupClient extends CW4GroupQueryClient implements CW4GroupInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateAdmin = this.updateAdmin.bind(this);
    this.updateMembers = this.updateMembers.bind(this);
    this.addHook = this.addHook.bind(this);
    this.removeHook = this.removeHook.bind(this);
  }

  updateAdmin = async ({
    admin
  }: {
    admin?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_admin: {
        admin
      }
    }, fee, memo, funds);
  };
  updateMembers = async ({
    add,
    remove
  }: {
    add: Member[];
    remove: string[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_members: {
        add,
        remove
      }
    }, fee, memo, funds);
  };
  addHook = async ({
    addr
  }: {
    addr: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      add_hook: {
        addr
      }
    }, fee, memo, funds);
  };
  removeHook = async ({
    addr
  }: {
    addr: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      remove_hook: {
        addr
      }
    }, fee, memo, funds);
  };
}