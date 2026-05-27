param(
  [string]$Region = "us-east-1",
  [string]$DbIdentifier = "xadani-postgres",
  [string]$DbName = "xadani",
  [string]$MasterUsername = "xadani_admin",
  [string]$AllocatedStorage = "20",
  [string]$DbInstanceClass = "db.t4g.micro",
  [string]$EngineVersion = "16.3"
)

$ErrorActionPreference = "Stop"
$Aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

if (!(Test-Path $Aws)) {
  $Aws = "aws"
}

Write-Host "Verificando identidad AWS..."
& $Aws sts get-caller-identity --region $Region | Out-Host

$Existing = & $Aws rds describe-db-instances `
  --region $Region `
  --db-instance-identifier $DbIdentifier `
  --query "DBInstances[0].DBInstanceIdentifier" `
  --output text 2>$null

if ($Existing -eq $DbIdentifier) {
  Write-Host "La instancia RDS ya existe: $DbIdentifier"
} else {
  $Password = Read-Host "Password para usuario $MasterUsername" -AsSecureString
  $PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
  )

  Write-Host "Creando instancia RDS PostgreSQL. Esto puede tardar varios minutos..."
  & $Aws rds create-db-instance `
    --region $Region `
    --db-instance-identifier $DbIdentifier `
    --db-name $DbName `
    --engine postgres `
    --engine-version $EngineVersion `
    --db-instance-class $DbInstanceClass `
    --allocated-storage $AllocatedStorage `
    --master-username $MasterUsername `
    --master-user-password $PlainPassword `
    --publicly-accessible `
    --backup-retention-period 7 `
    --storage-encrypted `
    --no-multi-az | Out-Host
}

Write-Host "Esperando a que RDS quede disponible..."
& $Aws rds wait db-instance-available `
  --region $Region `
  --db-instance-identifier $DbIdentifier

$Endpoint = & $Aws rds describe-db-instances `
  --region $Region `
  --db-instance-identifier $DbIdentifier `
  --query "DBInstances[0].Endpoint.Address" `
  --output text

Write-Host ""
Write-Host "Endpoint RDS:"
Write-Host $Endpoint
Write-Host ""
Write-Host "DATABASE_URL para Vercel:"
Write-Host "postgresql://$MasterUsername:TU_PASSWORD@$Endpoint:5432/$DbName?sslmode=require"
Write-Host ""
Write-Host "Importante: revisa el Security Group de RDS y permite inbound PostgreSQL 5432 desde Vercel/Internet si usaras conexion publica."
