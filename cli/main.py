"""GenXAI CLI - Main entry point."""

import click
from cli.commands import tool


@click.group()
@click.version_option(version='0.1.0', prog_name='genxai')
def cli():
    """GenXAI - Multi-Agent AI Framework CLI.
    
    Manage tools, agents, workflows, and more from the command line.
    """
    pass


# Register command groups
cli.add_command(tool)


def main():
    """Main entry point for the CLI."""
    cli()


if __name__ == '__main__':
    main()
