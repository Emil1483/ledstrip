export interface PortainerEnvironment {
    Id: number;
    Name: string;
    Type: number;
    URL: string;
    GroupId: number;
    PublicURL: string;
    Gpus: any[];
    TLSConfig: TLSConfig;
    AzureCredentials: AzureCredentials;
    TagIds: any[];
    Status: number;
    Snapshots: Snapshot[];
    UserAccessPolicies: TeamAccessPolicies;
    TeamAccessPolicies: TeamAccessPolicies;
    EdgeKey: string;
    EdgeCheckinInterval: number;
    Kubernetes: Kubernetes;
    ComposeSyntaxMaxVersion: string;
    SecuritySettings: SecuritySettings;
    LastCheckInDate: number;
    QueryDate: number;
    Heartbeat: boolean;
    UserTrusted: boolean;
    PostInitMigrations: PostInitMigrations;
    Edge: Edge;
    Agent: Agent;
    EnableGPUManagement: boolean;
    AuthorizedUsers: null;
    AuthorizedTeams: null;
    Tags: null;
    IsEdgeDevice: boolean;
    EdgeID?: string;
}

export interface Agent {
    Version: string;
}

export interface AzureCredentials {
    ApplicationID: string;
    TenantID: string;
    AuthenticationKey: string;
}

export interface Edge {
    AsyncMode: boolean;
    PingInterval: number;
    SnapshotInterval: number;
    CommandInterval: number;
}

export interface Kubernetes {
    Snapshots: any[];
    Configuration: Configuration;
    Flags: Flags;
}

export interface Configuration {
    UseLoadBalancer: boolean;
    UseServerMetrics: boolean;
    EnableResourceOverCommit: boolean;
    ResourceOverCommitPercentage: number;
    StorageClasses: any[];
    IngressClasses: any[];
    RestrictDefaultNamespace: boolean;
    IngressAvailabilityPerNamespace: boolean;
    AllowNoneIngressClass: boolean;
}

export interface Flags {
    IsServerMetricsDetected: boolean;
    IsServerIngressClassDetected: boolean;
    IsServerStorageDetected: boolean;
}

export interface PostInitMigrations {
    MigrateIngresses: boolean;
    MigrateGPUs: boolean;
}

export interface SecuritySettings {
    allowBindMountsForRegularUsers: boolean;
    allowPrivilegedModeForRegularUsers: boolean;
    allowVolumeBrowserForRegularUsers: boolean;
    allowHostNamespaceForRegularUsers: boolean;
    allowDeviceMappingForRegularUsers: boolean;
    allowStackManagementForRegularUsers: boolean;
    allowContainerCapabilitiesForRegularUsers: boolean;
    allowSysctlSettingForRegularUsers: boolean;
    enableHostManagementFeatures: boolean;
}

export interface Snapshot {
    Time: number;
    DockerVersion: string;
    Swarm: boolean;
    TotalCPU: number;
    TotalMemory: number;
    RunningContainerCount: number;
    StoppedContainerCount: number;
    HealthyContainerCount: number;
    UnhealthyContainerCount: number;
    VolumeCount: number;
    ImageCount: number;
    ServiceCount: number;
    StackCount: number;
    DockerSnapshotRaw: DockerSnapshotRaw;
    NodeCount: number;
    GpuUseAll: boolean;
    GpuUseList: any[];
}

export interface DockerSnapshotRaw {
    Containers: Container[];
    Volumes: Volumes;
    Networks: Network[];
    Images: Image[];
    Info: Info;
    Version: Version;
}

export interface Container {
    Id: string;
    Names: string[];
    Image: string;
    ImageID: string;
    Command: string;
    Created: number;
    Ports: Port[];
    Labels: Labels;
    State: State;
    Status: string;
    HostConfig: HostConfig;
    NetworkSettings: NetworkSettings;
    Mounts: Mount[];
}

export interface HostConfig {
    NetworkMode: NetworkMode;
}

export enum NetworkMode {
    Default = "default",
    Host = "host",
}

export interface Labels {
    "com.docker.desktop.extension.api.version"?: string;
    "com.docker.desktop.extension.icon"?: string;
    "com.docker.extension.additional-urls"?: string;
    "com.docker.extension.detailed-description"?: string;
    "com.docker.extension.publisher-url"?: string;
    "com.docker.extension.screenshots"?: string;
    "io.portainer.server"?: string;
    "org.opencontainers.image.description"?: string;
    "org.opencontainers.image.title"?: string;
    "org.opencontainers.image.vendor"?: string;
    maintainer?: string;
    "org.opencontainers.image.documentation"?: string;
    "org.opencontainers.image.licenses"?: string;
    "org.opencontainers.image.source"?: string;
    "org.opencontainers.image.url"?: string;
    "org.opencontainers.image.version"?: string;
    "io.portainer.agent"?: string;
}

export interface Mount {
    Type: string;
    Name?: string;
    Source: string;
    Destination: string;
    Driver?: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
}

export interface NetworkSettings {
    Networks: Networks;
}

export interface Networks {
    bridge?: Bridge;
    host?: Bridge;
    "ledstrip-network"?: Bridge;
}

export interface Bridge {
    IPAMConfig: null;
    Links: null;
    Aliases: null;
    NetworkID: NetworkID;
    EndpointID: string;
    Gateway: Gateway;
    IPAddress: IPAddress;
    IPPrefixLen: number;
    IPv6Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    MacAddress: MACAddress;
    DriverOpts: null;
}

export enum Gateway {
    Empty = "",
    The1721701 = "172.17.0.1",
    The1721801 = "172.18.0.1",
}

export enum IPAddress {
    Empty = "",
    The1721702 = "172.17.0.2",
    The1721703 = "172.17.0.3",
    The1721705 = "172.17.0.5",
    The1721802 = "172.18.0.2",
    The1721803 = "172.18.0.3",
}

export enum MACAddress {
    Empty = "",
    The0242AC110002 = "02:42:ac:11:00:02",
    The0242AC110003 = "02:42:ac:11:00:03",
    The0242AC110005 = "02:42:ac:11:00:05",
    The0242AC120002 = "02:42:ac:12:00:02",
    The0242AC120003 = "02:42:ac:12:00:03",
}

export enum NetworkID {
    E40D44730Bfc9C199F7818C2Ab6C37Fca0305A5C90D35A7226D7De8A59F68475 = "e40d44730bfc9c199f7818c2ab6c37fca0305a5c90d35a7226d7de8a59f68475",
    The022221Ad16B1238Ca7Bd7Aa6845Ada8075Fba994A5Ed0E3E706Cd81D08249D3A = "022221ad16b1238ca7bd7aa6845ada8075fba994a5ed0e3e706cd81d08249d3a",
    The529D9F7731Faefec594821Dde9Bb02C67Cd09Ebe28334A7F192C5A31C497B3Df = "529d9f7731faefec594821dde9bb02c67cd09ebe28334a7f192c5a31c497b3df",
    The5A703657152736Ae0F93E4Ea25E9C22115A5B61D52D91F66506F6D26C090Dbd9 = "5a703657152736ae0f93e4ea25e9c22115a5b61d52d91f66506f6d26c090dbd9",
    The6Afaac660Dc2F61391A788Eb451C392560B73Ca40E516D65E0D5E641Da791Ebf = "6afaac660dc2f61391a788eb451c392560b73ca40e516d65e0d5e641da791ebf",
    The8494E799Ec970E10670D7678134E8D18130Deda51E2Bfab4618Ee9E3408Ac492 = "8494e799ec970e10670d7678134e8d18130deda51e2bfab4618ee9e3408ac492",
}

export interface Port {
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
}

export enum State {
    Exited = "exited",
    Running = "running",
    Created = "created",
}

export interface Image {
    Containers: number;
    Created: number;
    Id: string;
    Labels: Labels | null;
    ParentId: string;
    RepoDigests: string[];
    RepoTags: string[];
    SharedSize: number;
    Size: number;
    VirtualSize: number;
}

export interface Info {
    ID: string;
    Containers: number;
    ContainersRunning: number;
    ContainersPaused: number;
    ContainersStopped: number;
    Images: number;
    Driver: string;
    DriverStatus: Array<string[]>;
    Plugins: Plugins;
    MemoryLimit: boolean;
    SwapLimit: boolean;
    CpuCfsPeriod: boolean;
    CpuCfsQuota: boolean;
    CPUShares: boolean;
    CPUSet: boolean;
    PidsLimit: boolean;
    IPv4Forwarding: boolean;
    BridgeNfIptables: boolean;
    BridgeNfIp6tables: boolean;
    Debug: boolean;
    NFd: number;
    OomKillDisable: boolean;
    NGoroutines: number;
    SystemTime: Date;
    LoggingDriver: string;
    CgroupDriver: string;
    CgroupVersion: string;
    NEventsListener: number;
    KernelVersion: string;
    OperatingSystem: string;
    OSVersion: string;
    OSType: string;
    Architecture: string;
    IndexServerAddress: string;
    RegistryConfig: RegistryConfig;
    NCPU: number;
    MemTotal: number;
    GenericResources: null;
    DockerRootDir: string;
    HttpProxy: string;
    HttpsProxy: string;
    NoProxy: string;
    Name: string;
    Labels: any[];
    ExperimentalBuild: boolean;
    ServerVersion: string;
    Runtimes: Runtimes;
    DefaultRuntime: string;
    Swarm: Swarm;
    LiveRestoreEnabled: boolean;
    Isolation: string;
    InitBinary: string;
    ContainerdCommit: Commit;
    RuncCommit: Commit;
    InitCommit: Commit;
    SecurityOptions: string[];
    Warnings: string[] | null;
}

export interface Commit {
    ID: string;
    Expected: string;
}

export interface Plugins {
    Volume: string[];
    Network: string[];
    Authorization: null;
    Log: string[];
}

export interface RegistryConfig {
    AllowNondistributableArtifactsCIDRs: null;
    AllowNondistributableArtifactsHostnames: null;
    InsecureRegistryCIDRs: string[];
    IndexConfigs: IndexConfigs;
    Mirrors: null;
}

export interface IndexConfigs {
    "docker.io": DockerIo;
}

export interface DockerIo {
    Name: string;
    Mirrors: any[];
    Secure: boolean;
    Official: boolean;
}

export interface Runtimes {
    "io.containerd.runc.v2": IoContainerdRuncV2;
    runc: IoContainerdRuncV2;
}

export interface IoContainerdRuncV2 {
    path: string;
}

export interface Swarm {
    NodeID: string;
    NodeAddr: string;
    LocalNodeState: string;
    ControlAvailable: boolean;
    Error: string;
    RemoteManagers: null;
}

export interface Network {
    Name: string;
    Id: string;
    Created: Date;
    Scope: string;
    Driver: string;
    EnableIPv6: boolean;
    IPAM: IPAM;
    Internal: boolean;
    Attachable: boolean;
    Ingress: boolean;
    ConfigFrom: ConfigFrom;
    ConfigOnly: boolean;
    Containers: TeamAccessPolicies;
    Options: Options;
    Labels: TeamAccessPolicies;
}

export interface ConfigFrom {
    Network: string;
}

export interface TeamAccessPolicies {}

export interface IPAM {
    Driver: NetworkMode;
    Options: null;
    Config: Config[] | null;
}

export interface Config {
    Subnet: string;
    Gateway: Gateway;
}

export interface Options {
    "com.docker.network.bridge.default_bridge"?: string;
    "com.docker.network.bridge.enable_icc"?: string;
    "com.docker.network.bridge.enable_ip_masquerade"?: string;
    "com.docker.network.bridge.host_binding_ipv4"?: string;
    "com.docker.network.bridge.name"?: string;
    "com.docker.network.driver.mtu"?: string;
}

export interface Version {
    Platform: Platform;
    Components: Component[];
    Version: string;
    ApiVersion: string;
    MinAPIVersion: string;
    GitCommit: string;
    GoVersion: string;
    Os: string;
    Arch: string;
    KernelVersion: string;
    BuildTime: Date;
}

export interface Component {
    Name: string;
    Version: string;
    Details: Details;
}

export interface Details {
    ApiVersion?: string;
    Arch?: string;
    BuildTime?: Date;
    Experimental?: string;
    GitCommit: string;
    GoVersion?: string;
    KernelVersion?: string;
    MinAPIVersion?: string;
    Os?: string;
}

export interface Platform {
    Name: string;
}

export interface Volumes {
    Volumes: Volume[];
    Warnings: null;
}

export interface Volume {
    CreatedAt: Date;
    Driver: string;
    Labels: null;
    Mountpoint: string;
    Name: string;
    Options: TeamAccessPolicies;
    Scope: string;
}

export interface TLSConfig {
    TLS: boolean;
    TLSSkipVerify: boolean;
}
