
#!/bin/bash

# Check if environment is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <environment>"
    echo "Available environments: dev, staging, production"
    exit 1
fi

ENV=$1
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TERRAFORM_DIR="$SCRIPT_DIR/../enviroment/$ENV"

# Check if environment directory exists
if [ ! -d "$TERRAFORM_DIR" ]; then
    echo "Error: Environment '$ENV' not found"
    exit 1
fi

# Initialize Terraform
echo "Initializing Terraform..."
cd "$TERRAFORM_DIR"
terraform init

# Plan destruction
echo "Planning destruction..."
terraform plan -destroy -out=tfplan

# Ask for confirmation
read -p "WARNING: This will destroy all resources in the $ENV environment. Are you sure? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Apply destruction
    echo "Destroying resources..."
    terraform apply tfplan
else
    echo "Cleanup cancelled"
    rm tfplan
    exit 0
fi

# Clean up plan file
rm tfplan

echo "Cleanup completed successfully"
