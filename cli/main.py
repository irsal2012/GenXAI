"""GenXAI CLI - Main entry point."""

import click
from cli.commands import tool, metrics, connector, workflow
from cli.commands.approval import approval
from cli.commands.audit import audit


@click.group()
@click.version_option(version='0.1.0', prog_name='genxai')
def cli():
    """GenXAI - Multi-Agent AI Framework CLI.
    
    Manage tools, agents, workflows, and more from the command line.
    """
    pass


# Register command groups
cli.add_command(tool)
cli.add_command(metrics)
cli.add_command(connector)
cli.add_command(workflow)
cli.add_command(approval)
cli.add_command(audit)


def main():
    """Main entry point for the CLI."""
    cli()


if __name__ == '__main__':
    main()
