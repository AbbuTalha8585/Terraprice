import { useRef, useEffect, useState, useMemo } from "react";

// ── REGION NAME MAP ───────────────────────────────────────────────────────────
const REGION_NAMES = {
    "us-east-1":"N. Virginia","us-east-2":"Ohio","us-west-1":"N. California","us-west-2":"Oregon",
    "eu-west-1":"Ireland","eu-west-2":"London","eu-west-3":"Paris","eu-central-1":"Frankfurt",
    "eu-north-1":"Stockholm","eu-south-1":"Milan","ap-south-1":"Mumbai","ap-south-2":"Hyderabad",
    "ap-southeast-1":"Singapore","ap-southeast-2":"Sydney","ap-northeast-1":"Tokyo",
    "ap-northeast-2":"Seoul","ap-northeast-3":"Osaka","ap-east-1":"Hong Kong",
    "ca-central-1":"Canada Central","sa-east-1":"São Paulo","me-south-1":"Bahrain",
    "af-south-1":"Cape Town","il-central-1":"Tel Aviv",
    "eastus":"East US","eastus2":"East US 2","westus":"West US","westus2":"West US 2",
    "westus3":"West US 3","centralus":"Central US","northeurope":"North Europe",
    "westeurope":"West Europe","uksouth":"UK South","eastasia":"East Asia",
    "southeastasia":"Southeast Asia","australiaeast":"Australia East",
    "brazilsouth":"Brazil South","canadacentral":"Canada Central",
    "centralindia":"Central India","japaneast":"Japan East","koreacentral":"Korea Central",
    "us-central1":"Iowa","us-east1":"South Carolina","us-east4":"N. Virginia",
    "us-west1":"Oregon","us-west2":"Los Angeles","europe-west1":"Belgium",
    "europe-west2":"London","europe-west3":"Frankfurt","europe-west4":"Netherlands",
    "asia-east1":"Taiwan","asia-northeast1":"Tokyo","asia-south1":"Mumbai",
    "asia-southeast1":"Singapore","australia-southeast1":"Sydney",
    "northamerica-northeast1":"Montréal","southamerica-east1":"São Paulo",
};

// ── RESOURCE TYPE CONFIG ──────────────────────────────────────────────────────
const TYPES = {
    user: { tag:"WWW",  label:"Internet",            color:"#22D3EE" },
    aws_vpc:                            { tag:"VPC",  label:"VPC",                  color:"#3B82F6" },
    aws_subnet:                         { tag:"NET",  label:"Subnet",               color:"#3B82F6" },
    aws_internet_gateway:               { tag:"IGW",  label:"IGW",                  color:"#3B82F6" },
    aws_nat_gateway:                    { tag:"NAT",  label:"NAT GW",               color:"#3B82F6" },
    aws_vpn_gateway:                    { tag:"VPN",  label:"VPN Gateway",          color:"#3B82F6" },
    aws_transit_gateway:                { tag:"TGW",  label:"Transit GW",           color:"#3B82F6" },
    aws_route53_zone:                   { tag:"R53",  label:"Route 53",             color:"#3B82F6" },
    aws_route53_record:                 { tag:"DNS",  label:"DNS Record",           color:"#3B82F6" },
    aws_vpc_peering_connection:         { tag:"PRC",  label:"VPC Peering",          color:"#3B82F6" },
    aws_security_group:                 { tag:"SG",   label:"Security Group",       color:"#6B7280" },
    aws_wafv2_web_acl:                  { tag:"WAF",  label:"WAF",                  color:"#6B7280" },
    aws_acm_certificate:                { tag:"ACM",  label:"ACM Cert",             color:"#6B7280" },
    aws_cloudwatch_log_group:           { tag:"CWL",  label:"CloudWatch Logs",      color:"#6B7280" },
    aws_cloudwatch_metric_alarm:        { tag:"CWA",  label:"CW Alarm",             color:"#6B7280" },
    aws_lb:                             { tag:"ALB",  label:"Load Balancer",        color:"#EF4444" },
    aws_alb:                            { tag:"ALB",  label:"Load Balancer",        color:"#EF4444" },
    aws_lb_listener:                    { tag:"LST",  label:"LB Listener",          color:"#EF4444" },
    aws_lb_target_group:                { tag:"TG",   label:"Target Group",         color:"#EF4444" },
    aws_cloudfront_distribution:        { tag:"CDN",  label:"CloudFront",           color:"#EF4444" },
    aws_api_gateway_rest_api:           { tag:"APIG", label:"API Gateway",          color:"#EF4444" },
    aws_api_gateway_v2_api:             { tag:"APIG", label:"HTTP API GW",          color:"#EF4444" },
    aws_apigatewayv2_api:               { tag:"APIG", label:"API Gateway v2",       color:"#EF4444" },
    aws_instance:                       { tag:"EC2",  label:"EC2 Instance",         color:"#F97316" },
    aws_eks_cluster:                    { tag:"EKS",  label:"EKS Cluster",          color:"#F97316" },
    aws_eks_node_group:                 { tag:"NG",   label:"Node Group",           color:"#F97316" },
    aws_eks_fargate_profile:            { tag:"FGT",  label:"Fargate Profile",      color:"#F97316" },
    aws_lambda_function:                { tag:"λ",    label:"Lambda",               color:"#F97316" },
    aws_ecs_cluster:                    { tag:"ECS",  label:"ECS Cluster",          color:"#F97316" },
    aws_ecs_service:                    { tag:"SVC",  label:"ECS Service",          color:"#F97316" },
    aws_ecs_task_definition:            { tag:"TASK", label:"ECS Task",             color:"#F97316" },
    aws_autoscaling_group:              { tag:"ASG",  label:"Auto Scaling",         color:"#F97316" },
    aws_launch_template:                { tag:"LT",   label:"Launch Template",      color:"#F97316" },
    aws_ecr_repository:                 { tag:"ECR",  label:"ECR Repo",             color:"#F97316" },
    aws_batch_job_definition:           { tag:"BCH",  label:"Batch Job",            color:"#F97316" },
    aws_db_instance:                    { tag:"RDS",  label:"RDS Database",         color:"#10B981" },
    aws_rds_cluster:                    { tag:"AUR",  label:"Aurora Cluster",       color:"#10B981" },
    aws_elasticache_cluster:            { tag:"EC",   label:"ElastiCache",          color:"#10B981" },
    aws_elasticache_replication_group:  { tag:"ECR",  label:"ElastiCache RG",       color:"#10B981" },
    aws_dynamodb_table:                 { tag:"DDB",  label:"DynamoDB",             color:"#10B981" },
    aws_elasticsearch_domain:           { tag:"ES",   label:"Elasticsearch",        color:"#10B981" },
    aws_opensearch_domain:              { tag:"OSS",  label:"OpenSearch",           color:"#10B981" },
    aws_redshift_cluster:               { tag:"RS",   label:"Redshift",             color:"#10B981" },
    aws_kinesis_stream:                 { tag:"KSS",  label:"Kinesis Stream",       color:"#10B981" },
    aws_kinesis_firehose_delivery_stream:{ tag:"KFH", label:"Firehose",             color:"#10B981" },
    aws_dms_replication_instance:       { tag:"DMS",  label:"DMS",                  color:"#10B981" },
    aws_s3_bucket:                      { tag:"S3",   label:"S3 Bucket",            color:"#8B5CF6" },
    aws_efs_file_system:                { tag:"EFS",  label:"EFS",                  color:"#8B5CF6" },
    aws_ebs_volume:                     { tag:"EBS",  label:"EBS Volume",           color:"#8B5CF6" },
    aws_sqs_queue:                      { tag:"SQS",  label:"SQS Queue",            color:"#8B5CF6" },
    aws_sns_topic:                      { tag:"SNS",  label:"SNS Topic",            color:"#8B5CF6" },
    aws_mq_broker:                      { tag:"MQ",   label:"Amazon MQ",            color:"#8B5CF6" },
    aws_msk_cluster:                    { tag:"MSK",  label:"MSK Kafka",            color:"#8B5CF6" },
    aws_iam_role:                       { tag:"IAM",  label:"IAM Role",             color:"#8B5CF6" },
    aws_iam_policy:                     { tag:"POL",  label:"IAM Policy",           color:"#8B5CF6" },
    aws_iam_user:                       { tag:"USR",  label:"IAM User",             color:"#8B5CF6" },
    aws_kms_key:                        { tag:"KMS",  label:"KMS Key",              color:"#8B5CF6" },
    aws_secretsmanager_secret:          { tag:"SEC",  label:"Secret Manager",       color:"#8B5CF6" },
    aws_ssm_parameter:                  { tag:"SSM",  label:"SSM Param",            color:"#8B5CF6" },
    aws_cognito_user_pool:              { tag:"CGN",  label:"Cognito",              color:"#8B5CF6" },
    azurerm_virtual_network:            { tag:"VNET", label:"Virtual Network",      color:"#3B82F6" },
    azurerm_subnet:                     { tag:"SUB",  label:"Subnet",               color:"#3B82F6" },
    azurerm_public_ip:                  { tag:"PIP",  label:"Public IP",            color:"#3B82F6" },
    azurerm_nat_gateway:                { tag:"NAT",  label:"NAT Gateway",          color:"#3B82F6" },
    azurerm_virtual_network_gateway:    { tag:"VNG",  label:"VNet Gateway",         color:"#3B82F6" },
    azurerm_dns_zone:                   { tag:"DNS",  label:"DNS Zone",             color:"#3B82F6" },
    azurerm_express_route_circuit:      { tag:"ER",   label:"ExpressRoute",         color:"#3B82F6" },
    azurerm_network_security_group:     { tag:"NSG",  label:"NSG",                  color:"#6B7280" },
    azurerm_firewall:                   { tag:"FW",   label:"Azure Firewall",        color:"#6B7280" },
    azurerm_web_application_firewall_policy:{ tag:"WAF", label:"WAF Policy",        color:"#6B7280" },
    azurerm_application_gateway:        { tag:"AGW",  label:"App Gateway",          color:"#EF4444" },
    azurerm_lb:                         { tag:"LB",   label:"Load Balancer",        color:"#EF4444" },
    azurerm_frontdoor:                  { tag:"AFD",  label:"Front Door",           color:"#EF4444" },
    azurerm_cdn_profile:                { tag:"CDN",  label:"CDN Profile",          color:"#EF4444" },
    azurerm_api_management:             { tag:"APIM", label:"API Management",       color:"#EF4444" },
    azurerm_traffic_manager_profile:    { tag:"TM",   label:"Traffic Manager",      color:"#EF4444" },
    azurerm_linux_virtual_machine:      { tag:"VM",   label:"Linux VM",             color:"#F97316" },
    azurerm_windows_virtual_machine:    { tag:"VM",   label:"Windows VM",           color:"#F97316" },
    azurerm_virtual_machine:            { tag:"VM",   label:"Virtual Machine",      color:"#F97316" },
    azurerm_virtual_machine_scale_set:  { tag:"VMSS", label:"VM Scale Set",         color:"#F97316" },
    azurerm_kubernetes_cluster:         { tag:"AKS",  label:"AKS Cluster",          color:"#F97316" },
    azurerm_function_app:               { tag:"FN",   label:"Function App",         color:"#F97316" },
    azurerm_linux_function_app:         { tag:"FN",   label:"Function App",         color:"#F97316" },
    azurerm_linux_web_app:              { tag:"APP",  label:"Linux Web App",        color:"#F97316" },
    azurerm_windows_web_app:            { tag:"APP",  label:"Windows Web App",      color:"#F97316" },
    azurerm_app_service_plan:           { tag:"ASP",  label:"App Service Plan",     color:"#F97316" },
    azurerm_container_app:              { tag:"CA",   label:"Container App",        color:"#F97316" },
    azurerm_container_group:            { tag:"ACI",  label:"Container Instance",   color:"#F97316" },
    azurerm_sql_server:                 { tag:"SQL",  label:"SQL Server",           color:"#10B981" },
    azurerm_mssql_server:               { tag:"SQL",  label:"SQL Server",           color:"#10B981" },
    azurerm_mssql_database:             { tag:"SQLDB",label:"SQL Database",         color:"#10B981" },
    azurerm_postgresql_server:          { tag:"PG",   label:"PostgreSQL",           color:"#10B981" },
    azurerm_mysql_server:               { tag:"MY",   label:"MySQL Server",         color:"#10B981" },
    azurerm_cosmosdb_account:           { tag:"CDB",  label:"Cosmos DB",            color:"#10B981" },
    azurerm_redis_cache:                { tag:"RDS",  label:"Redis Cache",          color:"#10B981" },
    azurerm_synapse_workspace:          { tag:"SYN",  label:"Synapse",              color:"#10B981" },
    azurerm_storage_account:            { tag:"BLOB", label:"Storage Account",      color:"#8B5CF6" },
    azurerm_eventhub_namespace:         { tag:"EH",   label:"Event Hub",            color:"#8B5CF6" },
    azurerm_service_bus_namespace:      { tag:"SB",   label:"Service Bus",          color:"#8B5CF6" },
    azurerm_user_assigned_identity:     { tag:"MSI",  label:"Managed Identity",     color:"#8B5CF6" },
    azurerm_key_vault:                  { tag:"KV",   label:"Key Vault",            color:"#8B5CF6" },
    azurerm_container_registry:         { tag:"ACR",  label:"Container Registry",   color:"#F97316" },
    google_compute_network:             { tag:"VPC",  label:"VPC Network",          color:"#3B82F6" },
    google_compute_subnetwork:          { tag:"SUB",  label:"Subnetwork",           color:"#3B82F6" },
    google_compute_router:              { tag:"RTR",  label:"Cloud Router",         color:"#3B82F6" },
    google_dns_managed_zone:            { tag:"DNS",  label:"Cloud DNS",            color:"#3B82F6" },
    google_compute_vpn_gateway:         { tag:"VPN",  label:"VPN Gateway",          color:"#3B82F6" },
    google_compute_firewall:            { tag:"FW",   label:"Firewall Rule",        color:"#6B7280" },
    google_compute_ssl_policy:          { tag:"SSL",  label:"SSL Policy",           color:"#6B7280" },
    google_compute_forwarding_rule:     { tag:"LB",   label:"Forwarding Rule",      color:"#EF4444" },
    google_compute_url_map:             { tag:"LB",   label:"URL Map / LB",         color:"#EF4444" },
    google_compute_backend_service:     { tag:"BE",   label:"Backend Service",      color:"#EF4444" },
    google_compute_target_https_proxy:  { tag:"HTTPS",label:"HTTPS Proxy",          color:"#EF4444" },
    google_api_gateway_api:             { tag:"APIG", label:"API Gateway",          color:"#EF4444" },
    google_compute_instance:            { tag:"GCE",  label:"Compute Instance",     color:"#F97316" },
    google_compute_instance_group:      { tag:"GIG",  label:"Instance Group",       color:"#F97316" },
    google_compute_autoscaler:          { tag:"AS",   label:"Autoscaler",           color:"#F97316" },
    google_container_cluster:           { tag:"GKE",  label:"GKE Cluster",          color:"#F97316" },
    google_container_node_pool:         { tag:"NP",   label:"Node Pool",            color:"#F97316" },
    google_cloudfunctions_function:     { tag:"FN",   label:"Cloud Function",       color:"#F97316" },
    google_cloudfunctions2_function:    { tag:"FN",   label:"Cloud Function v2",    color:"#F97316" },
    google_cloud_run_service:           { tag:"CR",   label:"Cloud Run",            color:"#F97316" },
    google_app_engine_application:      { tag:"GAE",  label:"App Engine",           color:"#F97316" },
    google_artifact_registry_repository:{ tag:"GAR",  label:"Artifact Registry",    color:"#F97316" },
    google_sql_database_instance:       { tag:"SQL",  label:"Cloud SQL",            color:"#10B981" },
    google_bigtable_instance:           { tag:"BT",   label:"Bigtable",             color:"#10B981" },
    google_spanner_instance:            { tag:"SPAN", label:"Cloud Spanner",        color:"#10B981" },
    google_redis_instance:              { tag:"RDS",  label:"Memorystore",          color:"#10B981" },
    google_bigquery_dataset:            { tag:"BQ",   label:"BigQuery",             color:"#10B981" },
    google_firestore_document:          { tag:"FS",   label:"Firestore",            color:"#10B981" },
    google_storage_bucket:              { tag:"GCS",  label:"Cloud Storage",        color:"#8B5CF6" },
    google_pubsub_topic:                { tag:"PS",   label:"Pub/Sub Topic",        color:"#8B5CF6" },
    google_pubsub_subscription:         { tag:"PSS",  label:"Pub/Sub Sub",          color:"#8B5CF6" },
    google_service_account:             { tag:"SA",   label:"Service Account",      color:"#8B5CF6" },
    google_kms_key_ring:                { tag:"KMS",  label:"KMS Key Ring",         color:"#8B5CF6" },
    google_secret_manager_secret:       { tag:"SEC",  label:"Secret Manager",       color:"#8B5CF6" },
    default: { tag:"RES", label:"Resource", color:"#6B7280" },
};
const getType = t => TYPES[t] || TYPES.default;

// ── CLOUD DETECTION ───────────────────────────────────────────────────────────
function detectCloud(resources) {
    if (resources.some(r => r.type.startsWith("azurerm_"))) return "azure";
    if (resources.some(r => r.type.startsWith("google_")))  return "gcp";
    return "aws";
}

// ── ROLE MAP ─────────────────────────────────────────────────────────────────
const ROLE_MAP = {
    user:"internet",
    aws_internet_gateway:"gateway", aws_nat_gateway:"gateway", aws_vpn_gateway:"gateway",
    aws_transit_gateway:"gateway", aws_route53_zone:"gateway",
    azurerm_public_ip:"gateway", azurerm_nat_gateway:"gateway",
    azurerm_virtual_network_gateway:"gateway",
    google_compute_router:"gateway", google_compute_vpn_gateway:"gateway",
    aws_vpc:"vpc", azurerm_virtual_network:"vpc", google_compute_network:"vpc",
    aws_subnet:"subnet", azurerm_subnet:"subnet", google_compute_subnetwork:"subnet",
    aws_lb:"loadbalancer", aws_alb:"loadbalancer",
    aws_cloudfront_distribution:"loadbalancer",
    aws_api_gateway_rest_api:"loadbalancer", aws_api_gateway_v2_api:"loadbalancer",
    aws_apigatewayv2_api:"loadbalancer",
    azurerm_application_gateway:"loadbalancer", azurerm_lb:"loadbalancer",
    azurerm_frontdoor:"loadbalancer", azurerm_cdn_profile:"loadbalancer",
    azurerm_api_management:"loadbalancer", azurerm_traffic_manager_profile:"loadbalancer",
    google_compute_forwarding_rule:"loadbalancer", google_compute_url_map:"loadbalancer",
    google_compute_backend_service:"loadbalancer", google_api_gateway_api:"loadbalancer",
    aws_db_instance:"database", aws_rds_cluster:"database",
    aws_elasticache_cluster:"database", aws_elasticache_replication_group:"database",
    aws_dynamodb_table:"database", aws_elasticsearch_domain:"database",
    aws_opensearch_domain:"database", aws_redshift_cluster:"database",
    aws_kinesis_stream:"database", aws_kinesis_firehose_delivery_stream:"database",
    azurerm_sql_server:"database", azurerm_mssql_server:"database",
    azurerm_mssql_database:"database", azurerm_postgresql_server:"database",
    azurerm_mysql_server:"database", azurerm_cosmosdb_account:"database",
    azurerm_redis_cache:"database",
    google_sql_database_instance:"database", google_bigtable_instance:"database",
    google_spanner_instance:"database", google_redis_instance:"database",
    google_bigquery_dataset:"database", google_firestore_document:"database",
    aws_s3_bucket:"storage", aws_efs_file_system:"storage", aws_ebs_volume:"storage",
    aws_sqs_queue:"storage", aws_sns_topic:"storage",
    aws_msk_cluster:"storage", aws_mq_broker:"storage",
    azurerm_storage_account:"storage",
    azurerm_eventhub_namespace:"storage", azurerm_service_bus_namespace:"storage",
    google_storage_bucket:"storage",
    google_pubsub_topic:"storage", google_pubsub_subscription:"storage",
    aws_iam_role:"identity", aws_iam_policy:"identity", aws_iam_user:"identity",
    aws_kms_key:"identity", aws_secretsmanager_secret:"identity",
    aws_ssm_parameter:"identity", aws_cognito_user_pool:"identity",
    azurerm_user_assigned_identity:"identity", azurerm_key_vault:"identity",
    google_service_account:"identity", google_kms_key_ring:"identity",
    google_secret_manager_secret:"identity",
};
const COMPUTE_TYPES = new Set([
    "aws_instance","aws_eks_cluster","aws_eks_node_group","aws_eks_fargate_profile",
    "aws_lambda_function","aws_ecs_cluster","aws_ecs_service","aws_ecs_task_definition",
    "aws_autoscaling_group","aws_launch_template",
    "azurerm_linux_virtual_machine","azurerm_windows_virtual_machine","azurerm_virtual_machine",
    "azurerm_virtual_machine_scale_set","azurerm_kubernetes_cluster",
    "azurerm_function_app","azurerm_linux_function_app",
    "azurerm_linux_web_app","azurerm_windows_web_app",
    "azurerm_app_service_plan","azurerm_container_app","azurerm_container_group",
    "google_compute_instance","google_compute_instance_group","google_container_cluster",
    "google_container_node_pool","google_cloudfunctions_function","google_cloudfunctions2_function",
    "google_cloud_run_service","google_app_engine_application",
]);
function getRole(r) {
    if (ROLE_MAP[r.type]) return ROLE_MAP[r.type];
    if (COMPUTE_TYPES.has(r.type)) {
        const n = r.name.toLowerCase();
        if (n.includes("web") || n.includes("front") || n.includes("app") || n.includes("ui")) return "web";
        if (n.includes("back") || n.includes("api") || n.includes("svc") || n.includes("worker")) return "backend";
        return "compute";
    }
    return "other";
}

// ── CLOUD LABELS ──────────────────────────────────────────────────────────────
const CLOUD_META = {
    aws:   { prefix:"AWS Region",   regionKey:"region",   locKey:null,       conn:{ http:"HTTP",  api:"API", db:"DB",  storage:"S3",   identity:"IAM" } },
    azure: { prefix:"Azure Region", regionKey:null,       locKey:"location", conn:{ http:"HTTPS", api:"API", db:"SQL", storage:"BLOB", identity:"MSI" } },
    gcp:   { prefix:"GCP Region",   regionKey:"region",   locKey:null,       conn:{ http:"HTTPS", api:"API", db:"SQL", storage:"GCS",  identity:"SA"  } },
};
function buildRegionLabel(cloud, providerInfo) {
    const M = CLOUD_META[cloud] || CLOUD_META.aws;
    const code = providerInfo?.[M.regionKey] || providerInfo?.[M.locKey]
        || (cloud==="aws"?"us-east-1": cloud==="azure"?"eastus":"us-central1");
    const name = REGION_NAMES[code] || code;
    return `${M.prefix}: ${code}  ·  ${name}`;
}

// ── PARSE PROVIDER ────────────────────────────────────────────────────────────
function parseProvider(code) {
    const info = {};
    const re = /provider\s+"([^"]+)"\s*\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(code)) !== null) {
        const [, prov, body] = m;
        const rM = body.match(/region\s*=\s*"([^"]+)"/);
        const lM = body.match(/location\s*=\s*"([^"]+)"/);
        if (prov === "aws"     && rM) info.region   = rM[1];
        if (prov === "azurerm" && lM) info.location = lM[1].replace(/\s/g,"").toLowerCase();
        if (prov === "google"  && rM) info.region   = rM[1];
    }
    return info;
}

// ── PARSE REFERENCES ──────────────────────────────────────────────────────────
function parseReferences(code, knownKeys) {
    const edges = [];
    const known = new Set(knownKeys);
    const parts = code.split(/(?:^|\n)resource\s+"/);
    for (let i = 1; i < parts.length; i++) {
        const hm = parts[i].match(/^([^"]+)"\s+"([^"]+)"/);
        if (!hm) continue;
        const fromKey = hm[1] + "." + hm[2];
        const bodyStart = parts[i].indexOf("{") + 1;
        const body = parts[i].slice(bodyStart, bodyStart + 3000);
        const refRe = /\b((?:aws|azurerm|google)_\w+)\.([a-z][a-z0-9_]*)\b/g;
        let ref; const seen = new Set();
        while ((ref = refRe.exec(body)) !== null) {
            const toKey = ref[1] + "." + ref[2];
            if (toKey !== fromKey && known.has(toKey) && !seen.has(toKey)) {
                seen.add(toKey); edges.push({ from: fromKey, to: toKey });
            }
        }
        const depM = body.match(/depends_on\s*=\s*\[([^\]]*)\]/);
        if (depM) {
            const deps = depM[1].match(/\b((?:aws|azurerm|google)_\w+)\.([a-z][a-z0-9_]*)\b/g) || [];
            deps.forEach(d => {
                if (d !== fromKey && known.has(d) && !seen.has(d)) {
                    seen.add(d); edges.push({ from: fromKey, to: d });
                }
            });
        }
    }
    return edges;
}

// ── MAIN PARSER ───────────────────────────────────────────────────────────────
function parseTerraform(code) {
    const resources = [];
    const parts = code.split(/(?:^|\n)resource\s+"/);
    for (let i = 1; i < parts.length; i++) {
        const m = parts[i].match(/^([^"]+)"\s+"([^"]+)"\s*\{([\s\S]*)/);
        if (!m) continue;
        const [, type, name, body] = m;
        const ex = p => { const x = body.match(new RegExp(p+'\\s*=\\s*"([^"]+)"')); return x?x[1]:null; };
        resources.push({ type, name, cfg: {
            instance_type:  ex("instance_type"),
            instance_class: ex("instance_class"),
            cidr:           ex("cidr_block") || ex("address_space") || ex("ip_cidr_range"),
            engine:         ex("engine") || ex("sku"),
            bucket:         ex("bucket") || ex("name"),
            size:           ex("size") || ex("vm_size") || ex("machine_type"),
        }});
    }
    resources.push({ type:"user", name:"internet", cfg:{} });
    const providerInfo = parseProvider(code);
    const knownKeys    = resources.filter(r=>r.type!=="user").map(r=>r.type+"."+r.name);
    const refEdges     = parseReferences(code, knownKeys);
    return { resources, providerInfo, refEdges };
}

// ── DRAW HELPERS ──────────────────────────────────────────────────────────────
const hex2a = (h, a) => {
    const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
};
function rrect(ctx, x, y, w, h, r=8) {
    r=Math.min(r,w/2,h/2); ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function drawZone(ctx, x, y, w, h, label, bg, border, lc, dash=false) {
    ctx.save();
    rrect(ctx,x,y,w,h,10); ctx.fillStyle=bg; ctx.fill();
    ctx.strokeStyle=border; ctx.lineWidth=1.5;
    if(dash) ctx.setLineDash([7,4]);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.font="600 10.5px 'Space Grotesk',sans-serif";
    const tw=ctx.measureText(label).width;
    rrect(ctx,x+12,y+8,tw+18,19,5); ctx.fillStyle="rgba(4,7,15,0.92)"; ctx.fill();
    ctx.strokeStyle=border; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle=lc; ctx.fillText(label,x+21,y+21);
    ctx.restore();
}
function drawNode(ctx, rtype, name, cfg, x, y, NW, NH, boxes) {
    const t=getType(rtype);
    const info=cfg.instance_type||cfg.instance_class||cfg.engine||cfg.bucket||cfg.cidr||cfg.size||"";
    const lbl=name.length>12?name.slice(0,11)+"…":name;
    ctx.save();
    rrect(ctx,x+2,y+3,NW,NH,8); ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fill();
    rrect(ctx,x,y,NW,NH,8); ctx.fillStyle="#0C1520"; ctx.fill();
    ctx.strokeStyle=hex2a(t.color,0.6); ctx.lineWidth=1.5; ctx.stroke();
    rrect(ctx,x,y,NW,4,8); ctx.fillStyle=t.color; ctx.fill();
    ctx.fillRect(x,y+2,NW,2);
    ctx.fillStyle=t.color; ctx.fillRect(x,y+4,3,NH-10);
    const bW=32;
    rrect(ctx,x+7,y+9,bW,NH-18,5);
    ctx.fillStyle=hex2a(t.color,0.18); ctx.fill();
    ctx.strokeStyle=hex2a(t.color,0.3); ctx.lineWidth=1; ctx.stroke();
    ctx.font="700 9px 'JetBrains Mono',monospace";
    ctx.fillStyle=t.color; ctx.textAlign="center";
    ctx.fillText(t.tag,x+7+bW/2,y+NH/2+3);
    ctx.textAlign="left";
    const tx=x+7+bW+8;
    ctx.font="600 10px 'Space Grotesk',sans-serif"; ctx.fillStyle="#E8EDF5";
    ctx.fillText(lbl,tx,y+Math.round(NH*0.43));
    ctx.font="8.5px 'JetBrains Mono',monospace";
    if(info){ ctx.fillStyle=hex2a(t.color,0.75); ctx.fillText(info.slice(0,14),tx,y+Math.round(NH*0.70)); }
    else    { ctx.fillStyle="#4A5A75"; ctx.fillText(t.label.slice(0,14),tx,y+Math.round(NH*0.70)); }
    ctx.restore();
    boxes.push({key:rtype+"."+name,x,y,w:NW,h:NH,cx:x+NW/2,cy:y+NH/2,rtype,name,info,t});
}
function drawArrow(ctx, ax, ay, bx, by, color, label="", thick=false) {
    const horiz=Math.abs(by-ay)<4;
    ctx.save();
    ctx.strokeStyle=hex2a(color,0.15); ctx.lineWidth=thick?8:5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
    ctx.strokeStyle=color; ctx.lineWidth=thick?2.5:1.8; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
    ctx.beginPath(); ctx.arc(ax,ay,3,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
    const ang=horiz?(bx>ax?0:Math.PI):(by>ay?Math.PI/2:-Math.PI/2);
    const hs=thick?11:8;
    ctx.save(); ctx.translate(bx,by); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-hs,-hs*0.42); ctx.lineTo(-hs,hs*0.42); ctx.closePath();
    ctx.fillStyle=color; ctx.fill(); ctx.restore();
    if(label){
        const mx=horiz?(ax+bx)/2:ax+16, my=horiz?ay:(ay+by)/2;
        const LP=6, LH=15;
        ctx.font="700 8.5px 'Space Grotesk',sans-serif";
        const tw=ctx.measureText(label).width;
        rrect(ctx,mx-tw/2-LP,my-LH/2,tw+LP*2,LH,4);
        ctx.fillStyle="rgba(4,7,15,0.96)"; ctx.fill();
        ctx.strokeStyle=hex2a(color,0.65); ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle=color; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(label,mx,my);
    }
    ctx.restore();
}

// ── LAYOUT CONSTANTS ──────────────────────────────────────────────────────────
const OPAD=32, VPC_P=22, SUB_P=18, ZLH=30, MIDGAP=24;

// ── CHUNK HELPER ──────────────────────────────────────────────────────────────
function chunk(arr, n) {
    if (!arr.length) return [];
    const rows = [];
    for (let i = 0; i < arr.length; i += n) rows.push(arr.slice(i, i + n));
    return rows;
}

// ── MAIN DRAW ─────────────────────────────────────────────────────────────────
function draw(ctx, resources, refEdges, providerInfo, W, H) {
    const boxes = [];
    const cloud = detectCloud(resources);
    const connL = CLOUD_META[cloud]?.conn || CLOUD_META.aws.conn;
    const pubSubLabel  = cloud==="azure"?"Frontend Subnet":cloud==="gcp"?"Public Subnet":"Public";
    const privSubLabel = cloud==="azure"?"Backend Subnet":cloud==="gcp"?"Private Subnet":"Private";

    // ── Role buckets ──────────────────────────────────────────────────────────
    const internet   = resources.filter(r=>getRole(r)==="internet");
    const gateways   = resources.filter(r=>getRole(r)==="gateway");
    const vpcs       = resources.filter(r=>getRole(r)==="vpc");
    const subs       = resources.filter(r=>getRole(r)==="subnet");
    const lbs        = resources.filter(r=>getRole(r)==="loadbalancer");
    const webs       = resources.filter(r=>getRole(r)==="web");
    const backends   = resources.filter(r=>getRole(r)==="backend");
    const computes   = resources.filter(r=>getRole(r)==="compute");
    const dbs        = resources.filter(r=>getRole(r)==="database");
    const storages   = resources.filter(r=>getRole(r)==="storage");
    const identities = resources.filter(r=>getRole(r)==="identity");

    const webNodes     = webs.length     ? webs     : computes.slice(0, Math.ceil(computes.length/2));
    const backendNodes = backends.length ? backends : computes.slice(Math.ceil(computes.length/2));

    // ── Dynamic sizing based on total visible resource count ──────────────────
    const totalVis = lbs.length + webNodes.length + backendNodes.length +
                     dbs.length + storages.length + identities.length;
    const dynNW   = totalVis <= 5  ? 165 : totalVis <= 12 ? 150 : totalVis <= 20 ? 135 : 120;
    const dynNH   = totalVis <= 5  ? 60  : totalVis <= 12 ? 54  : totalVis <= 20 ? 48  : 44;
    const dynHGAP = totalVis <= 5  ? 36  : totalVis <= 12 ? 26  : totalVis <= 20 ? 20  : 16;
    const dynVGAP = totalVis <= 12 ? 14  : 12;
    const SEC_GAP = 20; // vertical gap between category sections inside private subnet

    // ── Max nodes per row — keeps the diagram from going too wide ─────────────
    const MAX_LB   = 4;
    const MAX_W    = totalVis <= 8 ? 2 : 3;
    const MAX_B    = totalVis <= 8 ? 2 : 3;
    const MAX_DB   = 4;
    const MAX_ST   = 3;
    const MAX_ID   = 3;

    // ── Chunk each category into rows ─────────────────────────────────────────
    const lbRows  = chunk(lbs,          MAX_LB);
    const webRows = chunk(webNodes,     MAX_W);
    const bkRows  = chunk(backendNodes, MAX_B);
    const dbRows  = chunk(dbs,          MAX_DB);
    const stRows  = chunk(storages,     MAX_ST);
    const idRows  = chunk(identities,   MAX_ID);

    // ── Section column counts ─────────────────────────────────────────────────
    const lCols = Math.min(lbs.length,          MAX_LB);
    const wCols = Math.min(webNodes.length,      MAX_W);
    const bCols = Math.min(backendNodes.length,  MAX_B);
    const dCols = Math.min(dbs.length,           MAX_DB);
    const sCols = Math.min(storages.length,      MAX_ST);
    const iCols = Math.min(identities.length,    MAX_ID);

    const U = dynNW + dynHGAP; // one column unit

    // Section pixel widths
    const wSecW  = Math.max(wCols, 1) * U;
    const bSecW  = backendNodes.length > 0 ? Math.max(bCols, 1) * U : 0;
    const dSecW  = dbs.length        > 0 ? Math.max(dCols, 1) * U - dynHGAP : 0;
    const sSecW  = storages.length   > 0 ? Math.max(sCols, 1) * U : 0;
    const iSecW  = identities.length > 0 ? Math.max(iCols, 1) * U : 0;
    const lSecW  = lbs.length        > 0 ? Math.max(lCols, 1) * U - dynHGAP : dynNW;

    // Private subnet inner content width = max of all row widths
    const privContentW = Math.max(
        wSecW + bSecW,                              // compute row (web + backend side by side)
        dbs.length        > 0 ? dSecW + dynHGAP : 0, // db row
        (sCols + iCols)   > 0 ? sSecW + iSecW   : 0, // service row
        dynNW
    );

    // ── Section heights ───────────────────────────────────────────────────────
    const compRowCount = Math.max(webRows.length, bkRows.length, lbs.length > 0 ? 0 : 1, 1);
    const compH = compRowCount * (dynNH + dynVGAP) - dynVGAP;
    const dbH   = dbRows.length > 0 ? dbRows.length * (dynNH + dynVGAP) - dynVGAP : 0;
    const servH = (stRows.length > 0 || idRows.length > 0)
        ? Math.max(stRows.length, idRows.length) * (dynNH + dynVGAP) - dynVGAP
        : 0;

    const privInnerH = compH
        + (dbH   > 0 ? SEC_GAP + dbH   : 0)
        + (servH > 0 ? SEC_GAP + servH : 0);

    // ── Y coordinates ─────────────────────────────────────────────────────────
    const regionTop  = OPAD;
    const vpcTop     = regionTop + ZLH + 14;
    const subTop     = vpcTop + ZLH + 12;
    const nodeTopY   = subTop + ZLH + SUB_P;  // Y of first node row

    const lbTotalH   = lbRows.length > 0
        ? lbRows.length * (dynNH + dynVGAP) - dynVGAP
        : dynNH;
    const pubSubH    = ZLH + SUB_P + lbTotalH + SUB_P;
    const privSubH   = ZLH + SUB_P + privInnerH + SUB_P;
    const maxSubH    = Math.max(pubSubH, privSubH);

    const vpcBot     = subTop + maxSubH + VPC_P + 8;
    const regionBot  = vpcBot + VPC_P + 10;
    const totalH     = regionBot + OPAD;

    // Section start Y (inside private subnet content)
    const compStartY = nodeTopY;
    const dbStartY   = compStartY + compH + SEC_GAP;
    const servStartY = dbStartY + (dbH > 0 ? dbH + SEC_GAP : 0);

    // ── X coordinates ─────────────────────────────────────────────────────────
    let cx = OPAD;

    // Internet (outside VPC, left side)
    const internetX = cx;
    cx += Math.max(internet.length, 1) * U;

    // Gateways
    const gwX = cx;
    cx += gateways.length > 0 ? gateways.length * U + MIDGAP : MIDGAP;

    // VPC starts
    const vpcStartX = cx; cx += VPC_P;

    // Public subnet
    const pubSubX = cx; cx += SUB_P;
    const lbStartX = cx;
    cx += lSecW + SUB_P + dynHGAP;
    const pubSubW = cx - pubSubX;

    // Gap between subnets
    cx += dynHGAP;

    // Private subnet
    const privSubX = cx; cx += SUB_P;
    const wSecStartX  = cx;                // web nodes start here
    const bSecStartX  = cx + wSecW;        // backend starts right of web
    const dSecStartX  = cx;                // DB nodes: same left edge as web
    const sSecStartX  = cx;                // storage: same left edge
    const iSecStartX  = cx + sSecW;        // identity: right of storage
    cx += privContentW + SUB_P;
    const privSubW = cx - privSubX;

    cx += VPC_P;
    const vpcW     = cx - vpcStartX;
    const naturalW = cx + OPAD;
    const offsetX  = Math.max(0, Math.round((W - naturalW) / 2));
    const ox = x => x + offsetX;

    // ── Background ────────────────────────────────────────────────────────────
    ctx.fillStyle="#04070F"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="rgba(255,255,255,0.018)";
    for(let gx=0;gx<W;gx+=26) for(let gy=0;gy<H;gy+=26){
        ctx.beginPath(); ctx.arc(gx,gy,0.8,0,Math.PI*2); ctx.fill();
    }

    // ── Zones ─────────────────────────────────────────────────────────────────
    const vpc_cidr   = vpcs[0]?.cfg?.cidr || "";
    const pubSub     = subs.find(s=>s.name.toLowerCase().match(/pub|front/));
    const privSub    = subs.find(s=>s!==pubSub);
    const pub_cidr   = pubSub?.cfg?.cidr  || "10.0.1.0/24";
    const priv_cidr  = privSub?.cfg?.cidr || "10.0.2.0/24";
    const vpcLabel   = vpc_cidr
        ? `${cloud==="azure"?"VNET":cloud==="gcp"?"VPC Network":"VPC"}  ·  ${vpc_cidr}`
        : (cloud==="azure"?"Virtual Network":cloud==="gcp"?"VPC Network":"VPC");
    const regionLabel = buildRegionLabel(cloud, providerInfo);

    drawZone(ctx,ox(OPAD),regionTop,naturalW-OPAD*2,regionBot-regionTop,
        regionLabel,"rgba(255,255,255,0.01)","rgba(255,255,255,0.12)","#8B949E",true);
    drawZone(ctx,ox(vpcStartX),vpcTop,vpcW,vpcBot-vpcTop,
        vpcLabel,"rgba(59,130,246,0.055)","rgba(59,130,246,0.38)","#3B82F6");
    drawZone(ctx,ox(pubSubX),subTop,pubSubW,maxSubH,
        `${pubSubLabel}  ·  ${pub_cidr}`,"rgba(16,185,129,0.07)","rgba(16,185,129,0.42)","#10B981");
    drawZone(ctx,ox(privSubX),subTop,privSubW,maxSubH,
        `${privSubLabel}  ·  ${priv_cidr}`,"rgba(249,115,22,0.07)","rgba(249,115,22,0.42)","#F97316");

    // ── Draw section dividers inside private subnet ───────────────────────────
    const divCol = "rgba(255,255,255,0.05)";
    if(dbH > 0){
        const divY = dbStartY - SEC_GAP / 2;
        ctx.save();
        ctx.strokeStyle=divCol; ctx.lineWidth=1; ctx.setLineDash([4,6]);
        ctx.beginPath(); ctx.moveTo(ox(privSubX+8),divY); ctx.lineTo(ox(privSubX+privSubW-8),divY);
        ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
    if(servH > 0){
        const divY = servStartY - SEC_GAP / 2;
        ctx.save();
        ctx.strokeStyle=divCol; ctx.lineWidth=1; ctx.setLineDash([4,6]);
        ctx.beginPath(); ctx.moveTo(ox(privSubX+8),divY); ctx.lineTo(ox(privSubX+privSubW-8),divY);
        ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }

    // ── Draw nodes ────────────────────────────────────────────────────────────
    // Internet & Gateway (outside VPC)
    internet.forEach((r,i) => drawNode(ctx,r.type,r.name,r.cfg,
        ox(internetX + i*U), compStartY, dynNW, dynNH, boxes));
    gateways.forEach((r,i) => drawNode(ctx,r.type,r.name,r.cfg,
        ox(gwX + i*U), compStartY, dynNW, dynNH, boxes));

    // LBs — multi-row in public subnet
    lbRows.forEach((row,ri) => row.forEach((r,ci) =>
        drawNode(ctx,r.type,r.name,r.cfg,
            ox(lbStartX + ci*U), compStartY + ri*(dynNH+dynVGAP), dynNW, dynNH, boxes)));

    // COMPUTE ROW — web (left) + backend (right), multi-row
    webRows.forEach((row,ri) => row.forEach((r,ci) =>
        drawNode(ctx,r.type,r.name,r.cfg,
            ox(wSecStartX + ci*U), compStartY + ri*(dynNH+dynVGAP), dynNW, dynNH, boxes)));
    bkRows.forEach((row,ri) => row.forEach((r,ci) =>
        drawNode(ctx,r.type,r.name,r.cfg,
            ox(bSecStartX + ci*U), compStartY + ri*(dynNH+dynVGAP), dynNW, dynNH, boxes)));

    // DATABASE ROW — full width below compute
    dbRows.forEach((row,ri) => row.forEach((r,ci) =>
        drawNode(ctx,r.type,r.name,r.cfg,
            ox(dSecStartX + ci*U), dbStartY + ri*(dynNH+dynVGAP), dynNW, dynNH, boxes)));

    // SERVICE ROW — storage (left) + identity (right) below databases
    stRows.forEach((row,ri) => row.forEach((r,ci) =>
        drawNode(ctx,r.type,r.name,r.cfg,
            ox(sSecStartX + ci*U), servStartY + ri*(dynNH+dynVGAP), dynNW, dynNH, boxes)));
    idRows.forEach((row,ri) => row.forEach((r,ci) =>
        drawNode(ctx,r.type,r.name,r.cfg,
            ox(iSecStartX + ci*U), servStartY + ri*(dynNH+dynVGAP), dynNW, dynNH, boxes)));

    // ── Connections ───────────────────────────────────────────────────────────
    const nm = {}; boxes.forEach(b => nm[b.key] = b);
    const K  = r => r.type + "." + r.name;

    // Horizontal arrow (same Y)
    const hA = (fk, tk, lbl="", thick=false) => {
        const f=nm[fk], t=nm[tk]; if(!f||!t) return;
        const gap = t.x - (f.x + f.w);
        drawArrow(ctx, f.x+f.w, f.cy, t.x, t.cy, hex2a(f.t.color,1), gap>=46?lbl:"", thick);
    };
    // Vertical arrow (different Y — used for cross-section connections)
    const vA = (fk, tk, lbl="") => {
        const f=nm[fk], t=nm[tk]; if(!f||!t) return;
        drawArrow(ctx, f.cx, f.y+f.h, t.cx, t.y, hex2a(f.t.color,1), lbl, false);
    };

    const u  = internet[0]     ? K(internet[0])     : null;
    const gw = gateways[0]     ? K(gateways[0])     : null;
    const lb = lbs[0]          ? K(lbs[0])          : null;
    const wb = webNodes[0]     ? K(webNodes[0])     : null;
    // For web→backend arrow, use the last web node in the first web row
    const wbLast = webRows[0]?.length > 0 ? K(webRows[0][webRows[0].length - 1]) : wb;
    const be = backendNodes[0] ? K(backendNodes[0]) : null;
    const db = dbs[0]          ? K(dbs[0])          : null;
    const st = storages[0]     ? K(storages[0])     : null;
    const id = identities[0]   ? K(identities[0])   : null;

    // Main pipeline — horizontal where same row, vertical across sections
    if(u && gw)               hA(u,      gw, "",           false);
    if(gw && lb)              hA(gw,     lb, "",           false);
    if(!gw && u && lb)        hA(u,      lb, "",           false);
    if(lb && wb)              hA(lb,     wb, connL.http,   true);
    if(gw && !lb && wb)       hA(gw,     wb, connL.http,   true);
    if(!gw && !lb && u && wb) hA(u,      wb, connL.http,   true);
    if(wbLast && be)          hA(wbLast, be, connL.api,    true);  // web→backend horizontal

    // Cross-section (vertical): backend/web → DB (below compute section)
    if(be && db)             vA(be, db, connL.db);
    else if(wb && db)        vA(wb, db, connL.db);

    // Cross-section (vertical): DB → Storage / Identity (below DB section)
    if(db && st)             vA(db, st, connL.storage);
    else if(wb && st)        vA(wb, st, connL.storage);
    if(db && id)             vA(db, id, connL.identity);
    else if(be && id)        vA(be, id, connL.identity);

    // ── Additional real reference-based connections ────────────────────────────
    const drawn = new Set([
        `${u}-${gw}`, `${gw}-${lb}`, `${u}-${lb}`, `${lb}-${wb}`, `${u}-${wb}`,
        `${wbLast}-${be}`, `${be}-${db}`, `${wb}-${db}`,
        `${db}-${st}`, `${wb}-${st}`, `${db}-${id}`, `${be}-${id}`,
    ]);
    if (refEdges.length > 0) {
        refEdges.forEach(e => {
            const f=nm[e.from], t=nm[e.to]; if(!f||!t) return;
            const pairKey = `${e.from}-${e.to}`;
            if (!drawn.has(pairKey)) {
                drawn.add(pairKey);
                const rf = getRole({type:f.rtype, name:f.name});
                const rt = getRole({type:t.rtype, name:t.name});
                const skip = ["vpc","subnet","other"];
                if (!skip.includes(rf) && !skip.includes(rt) && rf !== rt) {
                    if (Math.abs(f.cy - t.cy) < 10) {
                        drawArrow(ctx,f.x+f.w,f.cy,t.x,t.cy,hex2a(f.t.color,0.5),"",false);
                    } else {
                        drawArrow(ctx,f.cx,f.y+f.h,t.cx,t.y,hex2a(f.t.color,0.5),"",false);
                    }
                }
            }
        });
    }

    return { boxes, totalH, naturalW };
}

// ── SAMPLE ────────────────────────────────────────────────────────────────────
const SAMPLE = `provider "aws" {
  region = "ap-south-1"
}
resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }
resource "aws_subnet" "public"  { vpc_id = aws_vpc.main.id  cidr_block = "10.0.1.0/24" }
resource "aws_subnet" "private" { vpc_id = aws_vpc.main.id  cidr_block = "10.0.2.0/24" }
resource "aws_internet_gateway" "igw"   { vpc_id = aws_vpc.main.id }
resource "aws_lb"          "alb"        { name = "terraprice-alb"  subnets = [aws_subnet.public.id] }
resource "aws_instance"    "web"        { instance_type = "t3.medium"  subnet_id = aws_subnet.private.id }
resource "aws_instance"    "backend"    { instance_type = "t3.large"   subnet_id = aws_subnet.private.id }
resource "aws_db_instance" "postgres"   { instance_class = "db.t3.medium"  engine = "postgres" }
resource "aws_s3_bucket"   "reports"    { bucket = "terraprice-reports" }
resource "aws_iam_role"    "ec2_role"   { name = "ec2-role" }`;

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function TopologyView({ tfCode }) {
    const containerRef = useRef(null);
    const canvasRef    = useRef(null);
    const boxesRef     = useRef([]);
    const [tooltip, setTooltip] = useState(null);
    const [dims, setDims]       = useState({ w:900, h:400 });

    const parsed   = useMemo(() => parseTerraform(tfCode || SAMPLE), [tfCode]);
    const { resources, providerInfo, refEdges } = parsed;
    const cloud    = useMemo(() => detectCloud(resources), [resources]);

    const stats = useMemo(() => {
        const webNodes  = resources.filter(r=>getRole(r)==="web"||getRole(r)==="compute");
        const backNodes = resources.filter(r=>getRole(r)==="backend");
        return {
            resources:   resources.length,
            connections: [
                resources.some(r=>getRole(r)==="internet") && (resources.some(r=>getRole(r)==="gateway")||resources.some(r=>getRole(r)==="loadbalancer")),
                resources.some(r=>getRole(r)==="loadbalancer") && resources.some(r=>["web","compute"].includes(getRole(r))),
                resources.some(r=>getRole(r)==="gateway") && !resources.some(r=>getRole(r)==="loadbalancer") && resources.some(r=>["web","compute"].includes(getRole(r))),
                webNodes.length > 0 && backNodes.length > 0,
                backNodes.length > 0 && resources.some(r=>getRole(r)==="database"),
                resources.some(r=>["web","compute"].includes(getRole(r))) && resources.some(r=>getRole(r)==="storage"),
            ].filter(Boolean).length + Math.max(0, refEdges.length - 4),
            networks: resources.filter(r=>getRole(r)==="vpc").length,
            compute:  resources.filter(r=>["web","backend","compute"].includes(getRole(r))).length,
        };
    }, [resources, refEdges]);

    const insights = useMemo(() => {
        const warnings = [];
        const suggestions = [];

        const webNodes  = resources.filter(r=>getRole(r)==="web");
        const compNodes = resources.filter(r=>getRole(r)==="compute" || getRole(r)==="backend");
        const lbs       = resources.filter(r=>getRole(r)==="loadbalancer");
        const dbs       = resources.filter(r=>getRole(r)==="database");
        const igws      = resources.filter(r=>r.type === "aws_internet_gateway" || getRole(r)==="gateway");
        const nats      = resources.filter(r=>r.type === "aws_nat_gateway" || r.type==="azurerm_nat_gateway");
        const pubSubs   = resources.filter(r=>getRole(r)==="subnet" && r.name.toLowerCase().match(/pub|front/));
        const privSubs  = resources.filter(r=>getRole(r)==="subnet" && !r.name.toLowerCase().match(/pub|front/));

        if (webNodes.length > 0 && lbs.length === 0) {
            warnings.push("Missing Load Balancer: Your web instances are directly exposed or lack high-availability distribution.");
        }
        if ((webNodes.length + compNodes.length) === 1) {
            suggestions.push("Single Point of Failure: Only one compute instance detected. Consider using an Auto Scaling Group or multiple instances across AZs.");
        }
        if (privSubs.length > 0 && nats.length === 0 && igws.length > 0) {
            warnings.push("No NAT Gateway: Instances in private subnets will not have outbound internet access for updates or external APIs.");
        }
        if (dbs.length > 0 && privSubs.length === 0) {
            warnings.push("Database Exposure: Databases detected but no private subnets found. Ensure DBs are not placed in public subnets.");
        }

        return { warnings, suggestions };
    }, [resources]);

    useEffect(() => {
        const canvas=canvasRef.current, container=containerRef.current;
        if(!canvas||!container) return;
        const DPR=window.devicePixelRatio||1;
        const cW=Math.max(container.clientWidth||900, 200);
        // First pass: measure natural size
        const scratch=document.createElement("canvas");
        scratch.width=cW*DPR; scratch.height=2500*DPR;
        const sc=scratch.getContext("2d"); sc.scale(DPR,DPR);
        const { totalH, naturalW } = draw(sc, resources, refEdges, providerInfo, cW, 2500);
        // Second pass: draw at natural size
        const finalW = naturalW + OPAD * 2;
        const finalH = totalH;
        canvas.width  = finalW * DPR;
        canvas.height = finalH * DPR;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(1,0,0,1,0,0); ctx.scale(DPR,DPR);
        const { boxes } = draw(ctx, resources, refEdges, providerInfo, finalW, finalH);
        boxesRef.current = boxes;
        setDims({ w: finalW, h: finalH });
    }, [resources, refEdges, providerInfo]);

    const handleMouseMove = e => {
        const canvas=canvasRef.current; if(!canvas) return;
        const rect=canvas.getBoundingClientRect();
        const mx=(e.clientX-rect.left)*(dims.w/rect.width);
        const my=(e.clientY-rect.top)*(dims.h/rect.height);
        const hit=boxesRef.current.find(b=>mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h);
        if(hit){ setTooltip({x:e.clientX+14,y:e.clientY-10,node:hit}); canvas.style.cursor="pointer"; }
        else   { setTooltip(null); canvas.style.cursor="default"; }
    };

    const downloadPNG = () => {
        const a=document.createElement("a"); a.download="topology.png";
        a.href=canvasRef.current.toDataURL("image/png"); a.click();
    };

    const cloudBadge={aws:{label:"AWS",color:"#F97316"},azure:{label:"Azure",color:"#0089D6"},gcp:{label:"GCP",color:"#34A853"}}[cloud];
    const LEGEND=[
        {label:"Network / VPC",color:"#3B82F6"},{label:"Compute",color:"#F97316"},
        {label:"Database",color:"#10B981"},{label:"Load Balancer",color:"#EF4444"},
        {label:"Storage / IAM",color:"#8B5CF6"},{label:"Security",color:"#6B7280"},
    ];

    return (
        <div style={{width:"100%",fontFamily:"'Space Grotesk',sans-serif",marginBottom:24}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <h2 style={{fontSize:22,fontWeight:800,color:"#E8EDF5",letterSpacing:-0.5,margin:0}}>
                            Topology Visualizer
                        </h2>
                        <span style={{
                            background:hex2a(cloudBadge.color,0.12),
                            border:`1px solid ${hex2a(cloudBadge.color,0.35)}`,
                            color:cloudBadge.color,borderRadius:6,padding:"2px 10px",
                            fontSize:11,fontWeight:700,
                        }}>{cloudBadge.label}</span>
                        {refEdges.length > 0 && (
                            <span style={{
                                background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",
                                color:"#10B981",borderRadius:6,padding:"2px 10px",fontSize:10,fontWeight:600,
                            }}>⚡ {refEdges.length} real refs</span>
                        )}
                    </div>
                    <p style={{color:"#5A6A85",fontSize:13,margin:"4px 0 0"}}>Generated from your Terraform code</p>
                </div>
                <button onClick={downloadPNG} style={{
                    marginLeft:"auto",background:"#00F5C4",color:"#04070F",
                    border:"none",borderRadius:8,padding:"10px 20px",
                    fontWeight:700,fontSize:13,cursor:"pointer",
                }}>⬇ Export PNG</button>
            </div>

            {/* Legend */}
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:12}}>
                {LEGEND.map(l=>(
                    <div key={l.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#5A6A85"}}>
                        <div style={{width:9,height:9,borderRadius:2,background:l.color}}/>
                        {l.label}
                    </div>
                ))}
            </div>

            {/* Canvas */}
            <div ref={containerRef} style={{
                background:"#04070F",border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:12,marginBottom:14,width:"100%",
                overflowX:"auto",overflowY:"hidden",
            }}>
                <canvas ref={canvasRef}
                    style={{
                        display:"block",
                        width:dims.w+"px", height:dims.h+"px",
                        maxWidth:"100%",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={()=>setTooltip(null)}
                />
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
                {[
                    {label:"Resources",  value:stats.resources,   sub:"detected"},
                    {label:"Connections",value:stats.connections, sub:"dependencies"},
                    {label:"Networks",   value:stats.networks,    sub:"VPCs / VNETs"},
                    {label:"Compute",    value:stats.compute,     sub:"instances"},
                ].map(s=>(
                    <div key={s.label} style={{
                        background:"#080E1C",border:"1px solid rgba(255,255,255,0.05)",
                        borderRadius:10,padding:"12px 16px",
                    }}>
                        <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#5A6A85",marginBottom:4}}>{s.label}</div>
                        <div style={{fontSize:22,fontWeight:800,color:"#E8EDF5",fontFamily:"'JetBrains Mono',monospace"}}>{s.value}</div>
                        <div style={{fontSize:10,color:"#5A6A85"}}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Insights Panel */}
            {(insights.warnings.length > 0 || insights.suggestions.length > 0) ? (
                <div style={{
                    background:"#080E1C", border:"1px solid rgba(249,115,22,0.15)",
                    borderRadius:12, padding:"16px 20px", marginBottom:20
                }}>
                    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
                        <span style={{fontSize:16}}>💡</span>
                        <h3 style={{margin:0, fontSize:15, color:"#E8EDF5", fontWeight:700}}>Architecture Insights</h3>
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10}}>
                        {insights.warnings.map((w,i) => (
                            <div key={"w"+i} style={{display:"flex", gap:10, fontSize:13, color:"#FCA5A5", alignItems:"flex-start", background:"rgba(239,68,68,0.05)", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(239,68,68,0.1)"}}>
                                <span style={{marginTop:1}}>⚠️</span>
                                <span style={{lineHeight:1.4}}>{w}</span>
                            </div>
                        ))}
                        {insights.suggestions.map((s,i) => (
                            <div key={"s"+i} style={{display:"flex", gap:10, fontSize:13, color:"#93C5FD", alignItems:"flex-start", background:"rgba(59,130,246,0.05)", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(59,130,246,0.1)"}}>
                                <span style={{marginTop:1}}>ℹ️</span>
                                <span style={{lineHeight:1.4}}>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{
                    background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)",
                    borderRadius:12, padding:"12px 20px", marginBottom:20,
                    display:"flex", alignItems:"center", gap:10
                }}>
                    <span style={{fontSize:18}}>✅</span>
                    <span style={{fontSize:13, color:"#10B981", fontWeight:600}}>Architecture looks healthy. No major structural insights detected.</span>
                </div>
            )}

            {/* Tooltip */}
            {tooltip && (
                <div style={{
                    position:"fixed",left:tooltip.x,top:tooltip.y,
                    background:"#0D1628",border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:8,padding:"10px 14px",zIndex:9999,minWidth:180,
                    boxShadow:"0 8px 32px rgba(0,0,0,0.5)",pointerEvents:"none",
                }}>
                    <div style={{fontWeight:700,color:"#E8EDF5",fontSize:13,marginBottom:6,paddingBottom:6,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                        {tooltip.node.rtype}.{tooltip.node.name}
                    </div>
                    {[
                        ["Type", tooltip.node.t.label],
                        ["Name", tooltip.node.name],
                        tooltip.node.info ? ["Info", tooltip.node.info] : null,
                    ].filter(Boolean).map(([k,v])=>(
                        <div key={k} style={{display:"flex",justifyContent:"space-between",gap:14,fontSize:11,color:"#5A6A85",marginTop:3}}>
                            <span>{k}</span>
                            <span style={{color:"#C9D1D9",fontFamily:"monospace"}}>{v}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
