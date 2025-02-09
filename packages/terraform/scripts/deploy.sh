
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

# Validate Terraform configuration
echo "Validating Terraform configuration..."
terraform validate

if [ $? -ne 0 ]; then
    echo "Error: Terraform validation failed"
    exit 1
fi

# Plan Terraform changes
echo "Planning Terraform changes..."
terraform plan -out=tfplan

# Ask for confirmation
read -p "Do you want to apply these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Apply Terraform changes
    echo "Applying Terraform changes..."
    terraform apply tfplan
else
    echo "Deployment cancelled"
    rm tfplan
    exit 0
fi

# Clean up plan file
rm tfplan

echo "Deployment completed successfully"
