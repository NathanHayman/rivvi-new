output "web_acl_id" {
  description = "ID of the WAF Web ACL"
  value       = aws_wafv2_web_acl.main.id
}

output "web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = aws_wafv2_web_acl.main.arn
}

output "ip_set_id" {
  description = "ID of the IP set for blocked IPs"
  value       = aws_wafv2_ip_set.bad_ips.id
}

output "ip_set_arn" {
  description = "ARN of the IP set for blocked IPs"
  value       = aws_wafv2_ip_set.bad_ips.arn
}
