export interface INatureDistribJSON {
    malicious: number,
    average : number,
    truthfull: number
}

export interface IFollowersDistribJSON{
    nbFollowers : number[]
}

export interface IContentVeracityDistribJSON{
    malicious : number[],
    average: number[],
    truthfull: number[]
}

export interface IContentReplicationDistribJSON{
    data: [{ veracity: number, contentReplication: number }],
    totalUsers : number,
    nbSimul? : number
}

export interface IContentReplicationCaseJSON{
    data : [{contentReplication : number}]
}
